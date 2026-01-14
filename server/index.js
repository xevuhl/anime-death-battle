// Anime Death Battle - Server Entry Point
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Import game modules
const { selectRandomCharacter, characters } = require('./game/roulette');
const { calculateBattle } = require('./game/battle');
const { calculateSurvivalBattle, getDifficultyInfo } = require('./game/survival');
const { generateDraftPool, draftCharacter, getNextDrafter, isDraftComplete, getDraftState, PICKS_PER_PLAYER } = require('./game/draft');
const initApiRoutes = require('./routes/api');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// Data stores
const rooms = new Map();
const battleResults = new Map();

// Middleware
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

// API Routes
app.use('/api', initApiRoutes(battleResults, rooms));

// Generate unique room code
function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  if (rooms.has(code)) {
    return generateRoomCode();
  }
  return code;
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  // Get active rooms list
  socket.on('getRooms', () => {
    const activeRooms = [];
    rooms.forEach((room, code) => {
      if (room.phase === 'lobby' && room.isPublic) {
        activeRooms.push({
          code,
          hostName: room.players[0]?.name || 'Unknown',
          playerCount: room.players.length,
          maxPlayers: room.maxPlayers,
          spectatorCount: room.spectators.length,
          gameMode: room.gameMode || 'classic'
        });
      }
    });
    socket.emit('roomsList', activeRooms);
  });

  // Create a new room
  socket.on('createRoom', ({ playerName, maxPlayers, isPublic, gameMode }) => {
    const roomCode = generateRoomCode();
    const room = {
      code: roomCode,
      host: socket.id,
      maxPlayers: maxPlayers || 4,
      isPublic: isPublic !== false,
      gameMode: gameMode || 'classic', // 'classic', 'survival', 'draft'
      players: [{
        id: socket.id,
        name: playerName,
        ready: false,
        characters: [],
        spinsLeft: 3,
        isSpinning: false
      }],
      spectators: [],
      phase: 'lobby',
      currentPlayerIndex: 0,
      messages: [],
      // Survival mode specific
      survivalWave: 1,
      survivalScore: 0,
      // Draft mode specific
      draftPool: [],
      draftRound: 1
    };
    
    rooms.set(roomCode, room);
    socket.join(roomCode);
    socket.roomCode = roomCode;
    
    socket.emit('roomCreated', { 
      roomCode, 
      players: room.players,
      spectators: room.spectators,
      maxPlayers: room.maxPlayers,
      gameMode: room.gameMode
    });
    io.emit('roomsUpdated');
    console.log(`Room ${roomCode} created by ${playerName} (${room.gameMode} mode)`);
  });

  // Join existing room
  socket.on('joinRoom', ({ roomCode, playerName }) => {
    const room = rooms.get(roomCode.toUpperCase());
    
    if (!room) {
      socket.emit('error', { message: 'Room not found!' });
      return;
    }
    
    if (room.phase !== 'lobby') {
      socket.emit('error', { message: 'Game already in progress!' });
      return;
    }
    
    if (room.players.length >= room.maxPlayers) {
      socket.emit('error', { message: 'Room is full!' });
      return;
    }

    const player = {
      id: socket.id,
      name: playerName,
      ready: false,
      characters: [],
      spinsLeft: 3,
      isSpinning: false
    };
    
    room.players.push(player);
    socket.join(roomCode.toUpperCase());
    socket.roomCode = roomCode.toUpperCase();
    
    io.to(roomCode.toUpperCase()).emit('playerJoined', { 
      players: room.players,
      spectators: room.spectators,
      maxPlayers: room.maxPlayers
    });
    socket.emit('joinedRoom', { 
      roomCode: roomCode.toUpperCase(), 
      players: room.players,
      spectators: room.spectators,
      maxPlayers: room.maxPlayers,
      messages: room.messages.slice(-50),
      gameMode: room.gameMode
    });
    io.emit('roomsUpdated');
    console.log(`${playerName} joined room ${roomCode}`);
  });

  // Join as spectator
  socket.on('joinAsSpectator', ({ roomCode, spectatorName }) => {
    const room = rooms.get(roomCode.toUpperCase());
    
    if (!room) {
      socket.emit('error', { message: 'Room not found!' });
      return;
    }

    const spectator = {
      id: socket.id,
      name: spectatorName
    };
    
    room.spectators.push(spectator);
    socket.join(roomCode.toUpperCase());
    socket.roomCode = roomCode.toUpperCase();
    socket.isSpectator = true;
    
    io.to(roomCode.toUpperCase()).emit('spectatorJoined', { 
      spectators: room.spectators,
      players: room.players
    });
    socket.emit('joinedAsSpectator', { 
      roomCode: roomCode.toUpperCase(), 
      players: room.players,
      spectators: room.spectators,
      phase: room.phase,
      messages: room.messages.slice(-50),
      characters
    });
    console.log(`${spectatorName} joined room ${roomCode} as spectator`);
  });

  // Chat message
  socket.on('chatMessage', (message) => {
    const room = rooms.get(socket.roomCode);
    if (!room) return;

    const sender = room.players.find(p => p.id === socket.id) || 
                   room.spectators.find(s => s.id === socket.id);
    if (!sender) return;

    const chatMessage = {
      id: uuidv4(),
      senderId: socket.id,
      senderName: sender.name,
      message: message.substring(0, 200),
      timestamp: Date.now(),
      isSpectator: socket.isSpectator
    };
    
    room.messages.push(chatMessage);
    if (room.messages.length > 100) {
      room.messages = room.messages.slice(-100);
    }
    
    io.to(socket.roomCode).emit('newMessage', chatMessage);
  });

  // Player ready
  socket.on('playerReady', () => {
    const room = rooms.get(socket.roomCode);
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (player) {
      player.ready = true;
      io.to(socket.roomCode).emit('playerUpdate', { 
        players: room.players,
        spectators: room.spectators
      });

      // Check if all ready (need at least 2 players for classic/draft, 1 for survival)
      const minPlayers = room.gameMode === 'survival' ? 1 : 2;
      if (room.players.length >= minPlayers && room.players.every(p => p.ready)) {
        
        if (room.gameMode === 'draft') {
          // Start draft mode
          room.phase = 'drafting';
          room.draftPool = generateDraftPool(room.players.length);
          room.currentPlayerIndex = 0;
          room.draftRound = 1;
          
          io.to(socket.roomCode).emit('draftStart', {
            players: room.players,
            spectators: room.spectators,
            draftState: getDraftState(room),
            characters
          });
        } else if (room.gameMode === 'survival') {
          // Start survival mode - go straight to spinning for character selection
          room.phase = 'spinning';
          room.currentPlayerIndex = 0;
          room.survivalWave = 1;
          
          io.to(socket.roomCode).emit('gameStart', { 
            players: room.players,
            spectators: room.spectators,
            currentPlayer: room.players[0].id,
            characters,
            gameMode: 'survival'
          });
        } else {
          // Classic mode
          room.phase = 'spinning';
          room.currentPlayerIndex = 0;
          io.to(socket.roomCode).emit('gameStart', { 
            players: room.players,
            spectators: room.spectators,
            currentPlayer: room.players[0].id,
            characters,
            gameMode: 'classic'
          });
        }
        io.emit('roomsUpdated');
      }
    }
  });

  // Spin the wheel
  socket.on('spin', () => {
    const room = rooms.get(socket.roomCode);
    if (!room || room.phase !== 'spinning') return;

    const player = room.players.find(p => p.id === socket.id);
    const currentPlayer = room.players[room.currentPlayerIndex];
    
    // In survival mode, only check if it's a player in the room with spins left
    if (room.gameMode === 'survival') {
      if (!player || player.spinsLeft <= 0 || player.isSpinning) {
        return;
      }
    } else {
      // Classic mode - must be current player's turn
      if (!player || player.id !== currentPlayer.id || player.spinsLeft <= 0 || player.isSpinning) {
        return;
      }
    }

    player.isSpinning = true;
    
    // Weighted character selection
    const selectedCharacter = selectRandomCharacter();
    const characterIndex = characters.findIndex(c => c.id === selectedCharacter.id);
    
    io.to(socket.roomCode).emit('spinStarted', {
      playerId: socket.id,
      targetIndex: characterIndex,
      characters
    });

    // After animation
    setTimeout(() => {
      player.characters.push(selectedCharacter);
      player.spinsLeft--;
      player.isSpinning = false;

      io.to(socket.roomCode).emit('spinResult', {
        playerId: socket.id,
        character: selectedCharacter,
        players: room.players
      });

      // Handle survival mode differently
      if (room.gameMode === 'survival') {
        // In survival, player spins all 3, then battles AI
        if (player.spinsLeft === 0) {
          room.phase = 'survival_battle';
          
          // Calculate survival battle
          const battleData = calculateSurvivalBattle(player.characters, room.survivalWave);
          const resultId = uuidv4();
          
          battleResults.set(resultId, {
            ...battleData,
            timestamp: new Date().toISOString(),
            roomCode: socket.roomCode,
            gameMode: 'survival'
          });
          
          io.to(socket.roomCode).emit('survivalBattleResult', {
            ...battleData,
            shareId: resultId
          });
        } else {
          io.to(socket.roomCode).emit('nextTurn', {
            currentPlayer: player.id,
            players: room.players,
            gameMode: 'survival'
          });
        }
      } else {
        // Classic mode - next turn logic
        if (player.spinsLeft === 0) {
          room.currentPlayerIndex++;
          
          if (room.currentPlayerIndex >= room.players.length) {
            room.currentPlayerIndex = 0;
          }
          
          // Find next player with spins
          let checked = 0;
          while (room.players[room.currentPlayerIndex].spinsLeft === 0 && checked < room.players.length) {
            room.currentPlayerIndex = (room.currentPlayerIndex + 1) % room.players.length;
            checked++;
          }

          // All spins done = battle
          if (room.players.every(p => p.spinsLeft === 0)) {
            room.phase = 'battle';
            const battleData = calculateBattle(room);
            const resultId = uuidv4();
            battleResults.set(resultId, {
              ...battleData,
              timestamp: new Date().toISOString(),
              roomCode: socket.roomCode
            });
            
            io.to(socket.roomCode).emit('battleStart', {
              ...battleData,
              shareId: resultId
            });
          } else {
            io.to(socket.roomCode).emit('nextTurn', {
              currentPlayer: room.players[room.currentPlayerIndex].id,
              players: room.players
            });
          }
        } else {
          io.to(socket.roomCode).emit('nextTurn', {
            currentPlayer: room.players[room.currentPlayerIndex].id,
            players: room.players
          });
        }
      }
    }, 4000);
  });

  // Draft pick (for draft mode)
  socket.on('draftPick', ({ characterId }) => {
    const room = rooms.get(socket.roomCode);
    if (!room || room.phase !== 'drafting') return;
    
    const player = room.players.find(p => p.id === socket.id);
    const currentDrafter = room.players[room.currentPlayerIndex];
    
    if (!player || player.id !== currentDrafter.id) {
      socket.emit('error', { message: "It's not your turn to pick!" });
      return;
    }
    
    // Check if player already has max picks
    if (player.characters.length >= PICKS_PER_PLAYER) {
      socket.emit('error', { message: "You've already picked all your characters!" });
      return;
    }
    
    // Draft the character
    const result = draftCharacter(room.draftPool, characterId, socket.id);
    
    if (!result.success) {
      socket.emit('error', { message: result.error });
      return;
    }
    
    player.characters.push(result.character);
    
    io.to(socket.roomCode).emit('draftPicked', {
      playerId: socket.id,
      playerName: player.name,
      character: result.character,
      draftState: getDraftState(room)
    });
    
    // Check if draft is complete
    if (isDraftComplete(room.players)) {
      room.phase = 'battle';
      const battleData = calculateBattle(room);
      const resultId = uuidv4();
      
      battleResults.set(resultId, {
        ...battleData,
        timestamp: new Date().toISOString(),
        roomCode: socket.roomCode,
        gameMode: 'draft'
      });
      
      setTimeout(() => {
        io.to(socket.roomCode).emit('battleStart', {
          ...battleData,
          shareId: resultId,
          gameMode: 'draft'
        });
      }, 1000);
    } else {
      // Move to next drafter (snake draft)
      const next = getNextDrafter(room.currentPlayerIndex, room.players.length, room.draftRound);
      room.currentPlayerIndex = next.index;
      room.draftRound = next.round;
      
      io.to(socket.roomCode).emit('draftNextTurn', {
        draftState: getDraftState(room)
      });
    }
  });

  // Continue survival (after winning a wave)
  socket.on('survivalContinue', () => {
    const room = rooms.get(socket.roomCode);
    if (!room || room.gameMode !== 'survival' || room.phase !== 'survival_battle') return;
    
    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;
    
    // Increase wave
    room.survivalWave++;
    room.phase = 'survival_battle';
    
    // Battle next wave (keep the same team)
    const battleData = calculateSurvivalBattle(player.characters, room.survivalWave);
    const resultId = uuidv4();
    
    battleResults.set(resultId, {
      ...battleData,
      timestamp: new Date().toISOString(),
      roomCode: socket.roomCode,
      gameMode: 'survival'
    });
    
    io.to(socket.roomCode).emit('survivalBattleResult', {
      ...battleData,
      shareId: resultId
    });
  });

  // Rematch request
  socket.on('requestRematch', () => {
    const room = rooms.get(socket.roomCode);
    if (!room || (room.phase !== 'battle' && room.phase !== 'survival_battle')) return;

    // Reset all players
    room.players.forEach(player => {
      player.ready = false;
      player.characters = [];
      player.spinsLeft = 3;
      player.isSpinning = false;
    });
    
    room.phase = 'lobby';
    room.currentPlayerIndex = 0;
    room.draftPool = [];
    room.draftRound = 1;
    room.survivalWave = 1;
    room.survivalScore = 0;
    
    io.to(socket.roomCode).emit('rematchStarted', { 
      players: room.players,
      spectators: room.spectators,
      maxPlayers: room.maxPlayers,
      gameMode: room.gameMode
    });
  });

  // Leave room
  socket.on('leaveRoom', () => {
    handlePlayerLeave(socket);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    handlePlayerLeave(socket);
  });
});

function handlePlayerLeave(socket) {
  if (!socket.roomCode) return;
  
  const room = rooms.get(socket.roomCode);
  if (!room) return;
  
  if (socket.isSpectator) {
    room.spectators = room.spectators.filter(s => s.id !== socket.id);
    io.to(socket.roomCode).emit('spectatorLeft', { spectators: room.spectators });
  } else {
    room.players = room.players.filter(p => p.id !== socket.id);
    
    if (room.players.length === 0 && room.spectators.length === 0) {
      rooms.delete(socket.roomCode);
      console.log(`Room ${socket.roomCode} deleted (empty)`);
    } else if (room.players.length === 0) {
      rooms.delete(socket.roomCode);
      io.to(socket.roomCode).emit('roomClosed', { message: 'All players left the room' });
    } else {
      // Adjust turn if needed
      if (room.phase === 'spinning' && room.currentPlayerIndex >= room.players.length) {
        room.currentPlayerIndex = 0;
      }
      
      io.to(socket.roomCode).emit('playerLeft', { 
        players: room.players,
        spectators: room.spectators,
        currentPlayer: room.phase === 'spinning' ? room.players[room.currentPlayerIndex]?.id : null
      });
    }
  }
  
  socket.leave(socket.roomCode);
  io.emit('roomsUpdated');
}

// Start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║           🎮 ANIME DEATH BATTLE SERVER 🎮                 ║
╠═══════════════════════════════════════════════════════════╣
║  Server running on http://localhost:${PORT}                  ║
║                                                           ║
║  To expose to internet, run:                              ║
║  npx ngrok http ${PORT}                                      ║
╚═══════════════════════════════════════════════════════════╝
  `);
});
