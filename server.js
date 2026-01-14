const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Store game rooms
const rooms = new Map();
// Store battle results for sharing
const battleResults = new Map();

// Expanded anime characters with power levels (50 characters)
const animeCharacters = [
  // Dragon Ball
  { id: 1, name: "Goku", anime: "Dragon Ball", power: 9500, color: "#FF6B00" },
  { id: 2, name: "Vegeta", anime: "Dragon Ball", power: 9200, color: "#0000CD" },
  { id: 3, name: "Gohan", anime: "Dragon Ball", power: 8900, color: "#9400D3" },
  { id: 4, name: "Frieza", anime: "Dragon Ball", power: 9100, color: "#800080" },
  { id: 5, name: "Broly", anime: "Dragon Ball", power: 9600, color: "#228B22" },
  { id: 6, name: "Beerus", anime: "Dragon Ball", power: 9800, color: "#4B0082" },
  
  // One Punch Man
  { id: 7, name: "Saitama", anime: "One Punch Man", power: 9999, color: "#FFD700" },
  { id: 8, name: "Garou", anime: "One Punch Man", power: 9000, color: "#DC143C" },
  { id: 9, name: "Boros", anime: "One Punch Man", power: 8800, color: "#00CED1" },
  
  // Naruto
  { id: 10, name: "Naruto", anime: "Naruto", power: 8500, color: "#FF7F00" },
  { id: 11, name: "Sasuke", anime: "Naruto", power: 8400, color: "#4B0082" },
  { id: 12, name: "Madara Uchiha", anime: "Naruto", power: 9100, color: "#8B0000" },
  { id: 13, name: "Itachi Uchiha", anime: "Naruto", power: 8600, color: "#B22222" },
  { id: 14, name: "Kakashi", anime: "Naruto", power: 7800, color: "#708090" },
  { id: 15, name: "Minato", anime: "Naruto", power: 8300, color: "#FFD700" },
  { id: 16, name: "Pain", anime: "Naruto", power: 8700, color: "#FF4500" },
  
  // One Piece
  { id: 17, name: "Luffy", anime: "One Piece", power: 8200, color: "#FF0000" },
  { id: 18, name: "Zoro", anime: "One Piece", power: 8000, color: "#006400" },
  { id: 19, name: "Sanji", anime: "One Piece", power: 7700, color: "#FFD700" },
  { id: 20, name: "Kaido", anime: "One Piece", power: 9300, color: "#4169E1" },
  { id: 21, name: "Shanks", anime: "One Piece", power: 9000, color: "#DC143C" },
  { id: 22, name: "Whitebeard", anime: "One Piece", power: 9200, color: "#FFFFFF" },
  
  // Bleach
  { id: 23, name: "Ichigo", anime: "Bleach", power: 8000, color: "#FF4500" },
  { id: 24, name: "Aizen", anime: "Bleach", power: 9100, color: "#8B4513" },
  { id: 25, name: "Yamamoto", anime: "Bleach", power: 9000, color: "#FF6347" },
  
  // Attack on Titan
  { id: 26, name: "Eren Yeager", anime: "Attack on Titan", power: 7500, color: "#228B22" },
  { id: 27, name: "Levi Ackerman", anime: "Attack on Titan", power: 7800, color: "#2F4F4F" },
  { id: 28, name: "Mikasa", anime: "Attack on Titan", power: 7400, color: "#B22222" },
  
  // Jujutsu Kaisen
  { id: 29, name: "Gojo Satoru", anime: "Jujutsu Kaisen", power: 9200, color: "#4169E1" },
  { id: 30, name: "Sukuna", anime: "Jujutsu Kaisen", power: 9400, color: "#8B0000" },
  { id: 31, name: "Yuta Okkotsu", anime: "Jujutsu Kaisen", power: 8500, color: "#000080" },
  
  // Demon Slayer
  { id: 32, name: "Tanjiro", anime: "Demon Slayer", power: 7200, color: "#DC143C" },
  { id: 33, name: "Muzan", anime: "Demon Slayer", power: 8800, color: "#8B0000" },
  { id: 34, name: "Yoriichi", anime: "Demon Slayer", power: 9500, color: "#FF6347" },
  
  // My Hero Academia
  { id: 35, name: "All Might", anime: "My Hero Academia", power: 8800, color: "#FFD700" },
  { id: 36, name: "Deku", anime: "My Hero Academia", power: 7600, color: "#32CD32" },
  { id: 37, name: "All For One", anime: "My Hero Academia", power: 8700, color: "#2F4F4F" },
  
  // Seven Deadly Sins
  { id: 38, name: "Meliodas", anime: "Seven Deadly Sins", power: 8700, color: "#FFD700" },
  { id: 39, name: "Escanor", anime: "Seven Deadly Sins", power: 9300, color: "#FFA500" },
  
  // Mob Psycho 100
  { id: 40, name: "Mob", anime: "Mob Psycho 100", power: 9000, color: "#9932CC" },
  
  // Isekai
  { id: 41, name: "Rimuru", anime: "Tensura", power: 9400, color: "#00CED1" },
  { id: 42, name: "Ainz Ooal Gown", anime: "Overlord", power: 9100, color: "#4B0082" },
  { id: 43, name: "Anos Voldigoad", anime: "Misfit of Demon King", power: 9700, color: "#8B0000" },
  
  // Hunter x Hunter
  { id: 44, name: "Gon", anime: "Hunter x Hunter", power: 7500, color: "#32CD32" },
  { id: 45, name: "Killua", anime: "Hunter x Hunter", power: 7700, color: "#E0FFFF" },
  { id: 46, name: "Meruem", anime: "Hunter x Hunter", power: 9200, color: "#228B22" },
  { id: 47, name: "Netero", anime: "Hunter x Hunter", power: 8600, color: "#DAA520" },
  
  // Others
  { id: 48, name: "Light Yagami", anime: "Death Note", power: 5000, color: "#8B4513" },
  { id: 49, name: "Yusuke Urameshi", anime: "Yu Yu Hakusho", power: 7900, color: "#228B22" },
  { id: 50, name: "Saber", anime: "Fate/Stay Night", power: 8100, color: "#4169E1" }
];

// API endpoint to get characters
app.get('/api/characters', (req, res) => {
  res.json(animeCharacters);
});

// API endpoint to get active rooms (for room browser)
app.get('/api/rooms', (req, res) => {
  const activeRooms = [];
  rooms.forEach((room, code) => {
    if (room.phase === 'lobby' && room.isPublic) {
      activeRooms.push({
        code: code,
        hostName: room.players[0]?.name || 'Unknown',
        playerCount: room.players.length,
        maxPlayers: room.maxPlayers,
        spectatorCount: room.spectators.length
      });
    }
  });
  res.json(activeRooms);
});

// API endpoint to get battle results
app.get('/api/results/:id', (req, res) => {
  const result = battleResults.get(req.params.id);
  if (result) {
    res.json(result);
  } else {
    res.status(404).json({ error: 'Results not found' });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  // Request active rooms list
  socket.on('getRooms', () => {
    const activeRooms = [];
    rooms.forEach((room, code) => {
      if (room.phase === 'lobby' && room.isPublic) {
        activeRooms.push({
          code: code,
          hostName: room.players[0]?.name || 'Unknown',
          playerCount: room.players.length,
          maxPlayers: room.maxPlayers,
          spectatorCount: room.spectators.length
        });
      }
    });
    socket.emit('roomsList', activeRooms);
  });

  // Create a new room
  socket.on('createRoom', ({ playerName, maxPlayers, isPublic }) => {
    const roomCode = generateRoomCode();
    const room = {
      code: roomCode,
      host: socket.id,
      maxPlayers: maxPlayers || 4,
      isPublic: isPublic !== false,
      players: [{
        id: socket.id,
        name: playerName,
        characters: [],
        spinsLeft: 3,
        isSpinning: false,
        ready: false
      }],
      spectators: [],
      messages: [],
      phase: 'lobby', // lobby, spinning, battle, results
      currentPlayerIndex: 0
    };
    rooms.set(roomCode, room);
    socket.join(roomCode);
    socket.roomCode = roomCode;
    socket.isSpectator = false;
    socket.emit('roomCreated', { 
      roomCode, 
      players: room.players, 
      spectators: room.spectators,
      maxPlayers: room.maxPlayers,
      isPublic: room.isPublic
    });
    console.log(`Room ${roomCode} created by ${playerName} (max: ${room.maxPlayers}, public: ${room.isPublic})`);
    
    // Notify all clients about new room
    io.emit('roomsUpdated');
  });

  // Join an existing room as player
  socket.on('joinRoom', ({ roomCode, playerName }) => {
    const room = rooms.get(roomCode.toUpperCase());
    if (!room) {
      socket.emit('error', { message: 'Room not found!' });
      return;
    }
    if (room.phase !== 'lobby') {
      socket.emit('error', { message: 'Game already in progress! You can join as spectator.' });
      return;
    }
    if (room.players.length >= room.maxPlayers) {
      socket.emit('error', { message: `Room is full! (max ${room.maxPlayers} players)` });
      return;
    }

    const player = {
      id: socket.id,
      name: playerName,
      characters: [],
      spinsLeft: 3,
      isSpinning: false,
      ready: false
    };
    room.players.push(player);
    socket.join(roomCode.toUpperCase());
    socket.roomCode = roomCode.toUpperCase();
    socket.isSpectator = false;
    
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
      messages: room.messages.slice(-50) // Send last 50 messages
    });
    console.log(`${playerName} joined room ${roomCode}`);
    
    io.emit('roomsUpdated');
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
      characters: animeCharacters
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
      message: message.substring(0, 200), // Limit message length
      timestamp: Date.now(),
      isSpectator: socket.isSpectator
    };
    
    room.messages.push(chatMessage);
    // Keep only last 100 messages
    if (room.messages.length > 100) {
      room.messages = room.messages.slice(-100);
    }
    
    io.to(socket.roomCode).emit('newMessage', chatMessage);
  });

  // Player ready to start
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

      // Check if all players are ready (need at least 2 players)
      if (room.players.length >= 2 && room.players.every(p => p.ready)) {
        room.phase = 'spinning';
        room.currentPlayerIndex = 0;
        io.to(socket.roomCode).emit('gameStart', { 
          players: room.players,
          spectators: room.spectators,
          currentPlayer: room.players[0].id,
          characters: animeCharacters
        });
        io.emit('roomsUpdated');
      }
    }
  });

  // Player spins the wheel
  socket.on('spin', () => {
    const room = rooms.get(socket.roomCode);
    if (!room || room.phase !== 'spinning') return;

    const player = room.players.find(p => p.id === socket.id);
    const currentPlayer = room.players[room.currentPlayerIndex];
    
    if (!player || player.id !== currentPlayer.id || player.spinsLeft <= 0 || player.isSpinning) {
      return;
    }

    player.isSpinning = true;
    
    // Select a random character
    const randomIndex = Math.floor(Math.random() * animeCharacters.length);
    const selectedCharacter = animeCharacters[randomIndex];
    
    // Broadcast spin animation to all players
    io.to(socket.roomCode).emit('spinStarted', {
      playerId: socket.id,
      targetIndex: randomIndex,
      characters: animeCharacters
    });

    // After spin animation completes
    setTimeout(() => {
      player.characters.push(selectedCharacter);
      player.spinsLeft--;
      player.isSpinning = false;

      io.to(socket.roomCode).emit('spinResult', {
        playerId: socket.id,
        character: selectedCharacter,
        players: room.players
      });

      // Move to next player or check if spinning phase is complete
      if (player.spinsLeft === 0) {
        room.currentPlayerIndex++;
        
        // If we've gone through all players, check if anyone has spins left
        if (room.currentPlayerIndex >= room.players.length) {
          room.currentPlayerIndex = 0;
        }
        
        // Find next player with spins left
        let checked = 0;
        while (room.players[room.currentPlayerIndex].spinsLeft === 0 && checked < room.players.length) {
          room.currentPlayerIndex = (room.currentPlayerIndex + 1) % room.players.length;
          checked++;
        }

        // If no one has spins left, go to battle phase
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
        // Same player still has spins left - emit nextTurn to re-enable their button
        io.to(socket.roomCode).emit('nextTurn', {
          currentPlayer: player.id,
          players: room.players
        });
      }
    }, 4000); // Match spin animation duration
  });

  // Request rematch (stays in same room)
  socket.on('rematch', () => {
    const room = rooms.get(socket.roomCode);
    if (!room) return;

    // Only host or players can request rematch
    const isPlayer = room.players.some(p => p.id === socket.id);
    if (!isPlayer) return;

    // Reset all players
    room.players.forEach(p => {
      p.characters = [];
      p.spinsLeft = 3;
      p.isSpinning = false;
      p.ready = false;
    });
    room.phase = 'lobby';
    room.currentPlayerIndex = 0;

    io.to(socket.roomCode).emit('rematchStarted', { 
      players: room.players,
      spectators: room.spectators,
      maxPlayers: room.maxPlayers
    });
    io.emit('roomsUpdated');
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    
    if (socket.roomCode) {
      const room = rooms.get(socket.roomCode);
      if (room) {
        if (socket.isSpectator) {
          room.spectators = room.spectators.filter(s => s.id !== socket.id);
          io.to(socket.roomCode).emit('spectatorLeft', { spectators: room.spectators });
        } else {
          room.players = room.players.filter(p => p.id !== socket.id);
          
          if (room.players.length === 0 && room.spectators.length === 0) {
            rooms.delete(socket.roomCode);
            console.log(`Room ${socket.roomCode} deleted (empty)`);
          } else if (room.players.length === 0) {
            // All players left, only spectators remain - delete room
            rooms.delete(socket.roomCode);
            io.to(socket.roomCode).emit('roomClosed', { message: 'All players left the room' });
          } else {
            // If host left, assign new host
            if (room.host === socket.id) {
              room.host = room.players[0].id;
            }
            io.to(socket.roomCode).emit('playerLeft', { 
              players: room.players,
              spectators: room.spectators,
              host: room.host
            });
          }
        }
        io.emit('roomsUpdated');
      }
    }
  });
});

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // Make sure code is unique
  if (rooms.has(code)) {
    return generateRoomCode();
  }
  return code;
}

function calculateBattle(room) {
  const playerScores = room.players.map(player => {
    const totalPower = player.characters.reduce((sum, char) => sum + char.power, 0);
    return {
      id: player.id,
      name: player.name,
      characters: player.characters,
      totalPower
    };
  });

  // Sort by total power (highest first)
  playerScores.sort((a, b) => b.totalPower - a.totalPower);

  return {
    players: playerScores,
    winner: playerScores[0]
  };
}

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
