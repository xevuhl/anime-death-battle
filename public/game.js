// Anime character emoji mapping (expanded)
const characterEmojis = {
  'Goku': '🟠',
  'Vegeta': '💪',
  'Gohan': '📚',
  'Frieza': '👿',
  'Broly': '💚',
  'Beerus': '🐱',
  'Saitama': '👊',
  'Garou': '🐺',
  'Boros': '👁️',
  'Naruto': '🍥',
  'Sasuke': '⚡',
  'Madara Uchiha': '👁️',
  'Itachi Uchiha': '🌙',
  'Kakashi': '📖',
  'Minato': '⚡',
  'Pain': '🔴',
  'Luffy': '🏴‍☠️',
  'Zoro': '🗡️',
  'Sanji': '🦵',
  'Kaido': '🐉',
  'Shanks': '🦊',
  'Whitebeard': '🌊',
  'Ichigo': '⚔️',
  'Aizen': '🦋',
  'Yamamoto': '🔥',
  'Eren Yeager': '🦖',
  'Levi Ackerman': '🗡️',
  'Mikasa': '🧣',
  'Gojo Satoru': '👁️',
  'Sukuna': '👹',
  'Yuta Okkotsu': '💜',
  'Tanjiro': '🔥',
  'Muzan': '🌙',
  'Yoriichi': '☀️',
  'All Might': '💪',
  'Deku': '✊',
  'All For One': '🖐️',
  'Meliodas': '😈',
  'Escanor': '☀️',
  'Mob': '💜',
  'Rimuru': '🔵',
  'Ainz Ooal Gown': '💀',
  'Anos Voldigoad': '👑',
  'Gon': '🎣',
  'Killua': '⚡',
  'Meruem': '🐜',
  'Netero': '🙏',
  'Light Yagami': '📓',
  'Yusuke Urameshi': '👊',
  'Saber': '⚔️'
};

// Game state
let socket;
let myPlayerId;
let myName;
let currentRoom;
let characters = [];
let isMyTurn = false;
let isSpectator = false;
let selectedMaxPlayers = 4;
let selectedGameMode = 'classic'; // 'classic', 'survival', 'draft'
let currentDraftState = null;
let survivalWave = 1;

// Rarity colors and names for display
const rarityConfig = {
  common:    { color: '#9CA3AF', name: 'Common', glow: 'none' },
  uncommon:  { color: '#22C55E', name: 'Uncommon', glow: '0 0 15px rgba(34, 197, 94, 0.5)' },
  rare:      { color: '#3B82F6', name: 'Rare', glow: '0 0 20px rgba(59, 130, 246, 0.6)' },
  epic:      { color: '#A855F7', name: 'Epic', glow: '0 0 25px rgba(168, 85, 247, 0.7)' },
  legendary: { color: '#F59E0B', name: 'Legendary', glow: '0 0 30px rgba(245, 158, 11, 0.8), 0 0 60px rgba(245, 158, 11, 0.4)' }
};

// DOM Elements
const screens = {
  menu: document.getElementById('menuScreen'),
  browser: document.getElementById('browserScreen'),
  lobby: document.getElementById('lobbyScreen'),
  game: document.getElementById('gameScreen'),
  battle: document.getElementById('battleScreen'),
  spectator: document.getElementById('spectatorScreen'),
  results: document.getElementById('resultsScreen'),
  draft: document.getElementById('draftScreen'),
  survival: document.getElementById('survivalScreen')
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Check if viewing shared results
  const urlParams = new URLSearchParams(window.location.search);
  const shareId = urlParams.get('share');
  
  if (shareId) {
    loadSharedResults(shareId);
    return;
  }
  
  // Connect to socket
  socket = io();
  
  setupSocketListeners();
  setupEventListeners();
  setupAudioToggle();
});

// Setup audio toggle button
function setupAudioToggle() {
  const audioToggle = document.getElementById('audioToggle');
  if (audioToggle && window.audioManager) {
    audioToggle.addEventListener('click', () => {
      const enabled = window.audioManager.toggle();
      audioToggle.classList.toggle('muted', !enabled);
      audioToggle.textContent = enabled ? '🔊' : '🔇';
      audioToggle.title = enabled ? 'Mute Sound' : 'Unmute Sound';
    });
  }
}

function setupEventListeners() {
  // Room size buttons
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedMaxPlayers = parseInt(btn.dataset.size);
    });
  });

  // Game mode buttons
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedGameMode = btn.dataset.mode;
      
      // Update room size options based on mode
      const sizeButtons = document.querySelector('.room-size-buttons');
      if (selectedGameMode === 'survival') {
        sizeButtons.style.display = 'none';
        selectedMaxPlayers = 1;
      } else {
        sizeButtons.style.display = 'flex';
      }
    });
  });

  // Menu buttons
  document.getElementById('createRoomBtn').addEventListener('click', createRoom);
  document.getElementById('joinRoomBtn').addEventListener('click', joinRoom);
  document.getElementById('browseRoomsBtn').addEventListener('click', () => {
    showScreen('browser');
    socket.emit('getRooms');
  });
  
  document.getElementById('playerName').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') createRoom();
  });
  document.getElementById('roomCodeInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') joinRoom();
  });
  
  // Browser
  document.getElementById('refreshRoomsBtn').addEventListener('click', () => {
    socket.emit('getRooms');
  });
  document.getElementById('backToMenuBtn').addEventListener('click', () => {
    showScreen('menu');
  });
  
  // Lobby
  document.getElementById('copyCodeBtn').addEventListener('click', copyRoomCode);
  document.getElementById('readyBtn').addEventListener('click', () => {
    socket.emit('playerReady');
    document.getElementById('readyBtn').disabled = true;
    document.getElementById('readyBtn').textContent = '✅ Ready!';
  });
  
  // Game
  document.getElementById('spinBtn').addEventListener('click', spin);
  
  // Battle
  document.getElementById('shareBtn').addEventListener('click', shareResults);
  document.getElementById('rematchBtn').addEventListener('click', () => {
    socket.emit('rematch');
  });
  document.getElementById('leaveRoomBtn').addEventListener('click', leaveRoom);
  document.getElementById('leaveLobbyBtn').addEventListener('click', leaveRoom);
  
  // Chat - multiple chat inputs
  setupChatInput('chatInput', 'sendChatBtn');
  setupChatInput('gameChatInput', 'gameSendChatBtn');
  setupChatInput('battleChatInput', 'battleSendChatBtn');
  setupChatInput('spectatorChatInput', 'spectatorSendChatBtn');
  setupChatInput('draftChatInput', 'draftSendChatBtn');
  setupChatInput('survivalChatInput', 'survivalSendChatBtn');
}

function setupChatInput(inputId, buttonId) {
  const input = document.getElementById(inputId);
  const button = document.getElementById(buttonId);
  
  if (input && button) {
    button.addEventListener('click', () => sendChat(input));
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendChat(input);
    });
  }
}

function sendChat(inputElement) {
  const message = inputElement.value.trim();
  if (message) {
    socket.emit('chatMessage', message);
    inputElement.value = '';
  }
}

function setupSocketListeners() {
  socket.on('connect', () => {
    myPlayerId = socket.id;
    console.log('Connected:', myPlayerId);
  });
  
  socket.on('error', ({ message }) => {
    showToast(message, 'error');
  });
  
  socket.on('roomsList', (rooms) => {
    renderRoomsList(rooms);
  });
  
  socket.on('roomsUpdated', () => {
    if (screens.browser.classList.contains('active')) {
      socket.emit('getRooms');
    }
  });
  
  socket.on('roomCreated', ({ roomCode, players, spectators, maxPlayers, gameMode }) => {
    currentRoom = roomCode;
    isSpectator = false;
    selectedGameMode = gameMode || 'classic';
    showScreen('lobby');
    document.getElementById('roomCodeDisplay').textContent = roomCode;
    updateLobby(players, spectators, maxPlayers, gameMode);
  });
  
  socket.on('joinedRoom', ({ roomCode, players, spectators, maxPlayers, messages, gameMode }) => {
    currentRoom = roomCode;
    isSpectator = false;
    selectedGameMode = gameMode || 'classic';
    showScreen('lobby');
    document.getElementById('roomCodeDisplay').textContent = roomCode;
    updateLobby(players, spectators, maxPlayers, gameMode);
    // Load existing messages
    messages.forEach(msg => addChatMessage(msg));
  });
  
  socket.on('joinedAsSpectator', ({ roomCode, players, spectators, phase, messages, characters: chars }) => {
    currentRoom = roomCode;
    isSpectator = true;
    characters = chars;
    showScreen('spectator');
    updateSpectatorView(players, spectators, phase);
    // Load existing messages
    messages.forEach(msg => addChatMessage(msg));
  });
  
  socket.on('playerJoined', ({ players, spectators, maxPlayers }) => {
    updateLobby(players, spectators, maxPlayers, selectedGameMode);
    showToast('A new player joined!');
  });
  
  socket.on('spectatorJoined', ({ spectators, players }) => {
    updateSpectatorsList(spectators);
    showToast('A spectator joined!');
  });
  
  socket.on('playerUpdate', ({ players, spectators }) => {
    if (isSpectator) {
      updateSpectatorView(players, spectators, 'lobby');
    } else {
      updateLobby(players, spectators, players.length, selectedGameMode);
    }
  });
  
  socket.on('playerLeft', ({ players, spectators }) => {
    if (isSpectator) {
      updateSpectatorView(players, spectators, 'lobby');
    } else {
      updateLobby(players, spectators, 4, selectedGameMode);
    }
    showToast('A player left the room');
  });
  
  socket.on('spectatorLeft', ({ spectators }) => {
    updateSpectatorsList(spectators);
  });
  
  socket.on('newMessage', (message) => {
    addChatMessage(message);
  });
  
  socket.on('gameStart', ({ players, spectators, currentPlayer, characters: chars, gameMode }) => {
    characters = chars;
    selectedGameMode = gameMode || 'classic';
    if (isSpectator) {
      updateSpectatorView(players, spectators, 'spinning');
      setupSpectatorRoulette();
    } else {
      showScreen('game');
      setupRoulette();
      updateGameUI(players, currentPlayer);
    }
  });
  
  // Draft mode events
  socket.on('draftStart', ({ players, spectators, draftState, characters: chars }) => {
    characters = chars;
    currentDraftState = draftState;
    showScreen('draft');
    setupDraftUI(draftState);
  });
  
  socket.on('draftPicked', ({ playerId, playerName, character, draftState }) => {
    currentDraftState = draftState;
    updateDraftUI(draftState);
    showToast(`${playerName} picked ${character.name}!`);
  });
  
  socket.on('draftNextTurn', ({ draftState }) => {
    currentDraftState = draftState;
    updateDraftUI(draftState);
  });
  
  // Survival mode events
  socket.on('survivalBattleResult', (battleData) => {
    window.currentBattleData = battleData;
    survivalWave = battleData.wave;
    showSurvivalResults(battleData);
  });
  
  socket.on('spinStarted', ({ playerId, targetIndex }) => {
    animateRoulette(targetIndex);
    if (!isSpectator) {
      document.getElementById('spinBtn').disabled = true;
    }
  });
  
  socket.on('spinResult', ({ playerId, character, players }) => {
    if (!isSpectator && playerId === myPlayerId) {
      updateMyTeam(players.find(p => p.id === myPlayerId).characters);
    }
    if (isSpectator) {
      updateSpectatorGameView(players, null);
    } else {
      updateAllPlayersStatus(players, null);
    }
  });
  
  socket.on('nextTurn', ({ currentPlayer, players }) => {
    if (isSpectator) {
      updateSpectatorGameView(players, currentPlayer);
    } else {
      updateGameUI(players, currentPlayer);
    }
  });
  
  socket.on('battleStart', (battleData) => {
    window.currentBattleData = battleData;
    if (isSpectator) {
      showSpectatorBattleResults(battleData);
    } else {
      showBattleResults(battleData);
    }
  });
  
  socket.on('rematchStarted', ({ players, spectators, maxPlayers, gameMode }) => {
    selectedGameMode = gameMode || 'classic';
    survivalWave = 1;
    if (isSpectator) {
      updateSpectatorView(players, spectators, 'lobby');
    } else {
      showScreen('lobby');
      updateLobby(players, spectators, maxPlayers, gameMode);
      document.getElementById('readyBtn').disabled = false;
      document.getElementById('readyBtn').textContent = '✅ Ready!';
    }
  });
  
  socket.on('roomClosed', ({ message }) => {
    showToast(message);
    showScreen('menu');
  });
}

function showScreen(screenName) {
  Object.values(screens).forEach(screen => screen.classList.remove('active'));
  screens[screenName].classList.add('active');
}

function createRoom() {
  const name = document.getElementById('playerName').value.trim();
  if (!name) {
    showToast('Please enter your name!');
    return;
  }
  myName = name;
  const isPublic = document.getElementById('publicRoom').checked;
  socket.emit('createRoom', { 
    playerName: name, 
    maxPlayers: selectedGameMode === 'survival' ? 1 : selectedMaxPlayers,
    isPublic,
    gameMode: selectedGameMode
  });
}

function joinRoom() {
  const name = document.getElementById('playerName').value.trim();
  const roomCode = document.getElementById('roomCodeInput').value.trim().toUpperCase();
  
  if (!name) {
    showToast('Please enter your name!');
    return;
  }
  if (!roomCode || roomCode.length !== 4) {
    showToast('Please enter a valid room code!');
    return;
  }
  
  myName = name;
  currentRoom = roomCode;
  socket.emit('joinRoom', { roomCode, playerName: name });
}

function joinRoomFromBrowser(roomCode, asSpectator = false) {
  const name = document.getElementById('playerName').value.trim();
  if (!name) {
    showToast('Please enter your name first!');
    showScreen('menu');
    return;
  }
  myName = name;
  currentRoom = roomCode;
  
  if (asSpectator) {
    socket.emit('joinAsSpectator', { roomCode, spectatorName: name });
  } else {
    socket.emit('joinRoom', { roomCode, playerName: name });
  }
}

function copyRoomCode() {
  const code = document.getElementById('roomCodeDisplay').textContent;
  navigator.clipboard.writeText(code).then(() => {
    showToast('Room code copied!');
  });
}

// Old renderRoomsList moved to end of file with game mode support

// Old updateLobby moved to end of file with game mode support

function updateSpectatorsList(spectators) {
  const container = document.getElementById('spectatorsList');
  if (spectators.length === 0) {
    container.style.display = 'none';
    return;
  }
  
  container.style.display = 'block';
  container.innerHTML = `
    <h4>👁️ Spectators</h4>
    <div class="spectator-tags">
      ${spectators.map(s => `<span class="spectator-tag">${s.name}</span>`).join('')}
    </div>
  `;
}

function addChatMessage(message) {
  const html = `
    <div class="chat-message ${message.isSpectator ? 'spectator' : ''}">
      <span class="sender">${message.senderName}${message.isSpectator ? ' 👁️' : ''}:</span>
      ${escapeHtml(message.message)}
    </div>
  `;
  
  // Add to all chat containers
  ['chatMessages', 'gameChatMessages', 'battleChatMessages', 'spectatorChatMessages', 'draftChatMessages', 'survivalChatMessages'].forEach(id => {
    const container = document.getElementById(id);
    if (container) {
      container.innerHTML += html;
      container.scrollTop = container.scrollHeight;
    }
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function setupRoulette() {
  const container = document.getElementById('rouletteItems');
  
  // Create multiple copies for continuous spinning effect
  let html = '';
  for (let i = 0; i < 10; i++) {
    characters.forEach(char => {
      const rarity = char.rarity?.key || 'common';
      html += `
        <div class="roulette-item ${rarity}" style="color: ${char.color}; --char-color: ${char.color}">
          <div class="roulette-item-image ${rarity}" style="border-color: ${char.color}">
            <span class="roulette-emoji">${characterEmojis[char.name] || '⭐'}</span>
            <div class="roulette-item-glow"></div>
          </div>
          <div class="roulette-item-name">${char.name}</div>
          <div class="roulette-item-anime">${char.anime}</div>
        </div>
      `;
    });
  }
  container.innerHTML = html;
}

function setupSpectatorRoulette() {
  // Similar roulette setup for spectator view
  const content = document.getElementById('spectatorContent');
  content.innerHTML = `
    <div class="roulette-container">
      <div class="roulette-wheel">
        <div class="roulette-items" id="spectatorRouletteItems"></div>
      </div>
      <div class="roulette-pointer">▼</div>
    </div>
    <div class="all-players-status" id="spectatorPlayersStatus"></div>
  `;
  
  const container = document.getElementById('spectatorRouletteItems');
  let html = '';
  for (let i = 0; i < 10; i++) {
    characters.forEach(char => {
      const rarity = char.rarity?.key || 'common';
      html += `
        <div class="roulette-item ${rarity}" style="color: ${char.color}; --char-color: ${char.color}">
          <div class="roulette-item-image ${rarity}" style="border-color: ${char.color}">
            <span class="roulette-emoji">${characterEmojis[char.name] || '⭐'}</span>
            <div class="roulette-item-glow"></div>
          </div>
          <div class="roulette-item-name">${char.name}</div>
          <div class="roulette-item-anime">${char.anime}</div>
        </div>
      `;
    });
  }
  container.innerHTML = html;
}

function updateSpectatorView(players, spectators, phase) {
  const content = document.getElementById('spectatorContent');
  
  if (phase === 'lobby') {
    content.innerHTML = `
      <h3 style="text-align: center; margin-bottom: 20px;">Waiting for game to start...</h3>
      <div class="players-list">
        ${players.map(player => `
          <div class="player-card ${player.ready ? 'ready' : ''}">
            <div class="player-name">${player.name}</div>
            <div class="player-status ${player.ready ? 'ready' : ''}">${player.ready ? '✅ Ready' : '⏳ Waiting...'}</div>
          </div>
        `).join('')}
      </div>
    `;
  }
}

function updateSpectatorGameView(players, currentPlayerId) {
  const container = document.getElementById('spectatorPlayersStatus');
  if (!container) return;
  
  container.innerHTML = players.map(player => `
    <div class="player-status-card ${player.id === currentPlayerId ? 'current-turn' : ''}">
      <div class="player-status-name">${player.name}</div>
      <div class="player-status-spins">${'🎰'.repeat(player.spinsLeft)} ${player.spinsLeft > 0 ? '' : '✅'}</div>
      <div class="player-status-chars">
        ${player.characters.map(char => `
          <div class="mini-char" style="border-color: ${char.color}" title="${char.name}">
            ${characterEmojis[char.name] || '⭐'}
          </div>
        `).join('') || '<span style="opacity: 0.5; font-size: 0.8rem">No chars yet</span>'}
      </div>
    </div>
  `).join('');
}

function updateGameUI(players, currentPlayerId) {
  const myPlayer = players.find(p => p.id === myPlayerId);
  if (!myPlayer) return;
  
  isMyTurn = currentPlayerId === myPlayerId;
  
  // Update turn indicator
  const turnIndicator = document.getElementById('turnIndicator');
  if (isMyTurn) {
    turnIndicator.textContent = "🎯 YOUR TURN!";
    turnIndicator.className = 'turn-indicator your-turn';
  } else {
    const currentPlayer = players.find(p => p.id === currentPlayerId);
    turnIndicator.textContent = `⏳ ${currentPlayer?.name || 'Unknown'}'s turn`;
    turnIndicator.className = 'turn-indicator';
  }
  
  // Update spins left
  document.getElementById('spinsLeft').textContent = `Spins left: ${'🎰'.repeat(myPlayer.spinsLeft)}`;
  
  // Update spin button
  const spinBtn = document.getElementById('spinBtn');
  spinBtn.disabled = !isMyTurn || myPlayer.spinsLeft === 0;
  
  // Update my team
  updateMyTeam(myPlayer.characters);
  
  // Update all players status
  updateAllPlayersStatus(players, currentPlayerId);
}

function updateMyTeam(myCharacters) {
  const container = document.getElementById('myTeam');
  
  if (myCharacters.length === 0) {
    container.innerHTML = '<p style="opacity: 0.5">Spin to collect characters!</p>';
    return;
  }
  
  container.innerHTML = myCharacters.map(char => {
    const rarity = char.rarity || { key: 'common', name: 'Common', color: '#9CA3AF' };
    const rarityStyle = rarityConfig[rarity.key] || rarityConfig.common;
    const isLegendary = rarity.key === 'legendary';
    const isEpic = rarity.key === 'epic';
    const charEmoji = characterEmojis[char.name] || '⭐';
    
    return `
      <div class="character-card ${isLegendary ? 'legendary' : ''} ${isEpic ? 'epic' : ''}" 
           style="border-color: ${rarityStyle.color}; box-shadow: ${rarityStyle.glow}; --char-color: ${char.color}">
        <div class="rarity-badge" style="background: ${rarityStyle.color}">${rarity.name}</div>
        <div class="character-card-image" style="border-color: ${rarityStyle.color}">
          <span class="character-card-emoji">${charEmoji}</span>
        </div>
        <div class="character-card-name">${char.name}</div>
        <div class="character-card-anime">${char.anime}</div>
        <div class="character-card-power">⚡ ${char.power.toLocaleString()}</div>
      </div>
    `;
  }).join('');
  
  // Play reveal sound for rarity
  if (window.audioManager && myCharacters.length > 0) {
    const lastChar = myCharacters[myCharacters.length - 1];
    const rarity = lastChar.rarity?.key || 'common';
    window.audioManager.playCharacterReveal(rarity);
  }
  
  // Show synergy preview
  updateSynergyPreview(myCharacters);
}

function updateSynergyPreview(myCharacters) {
  // Count characters by anime
  const animeCounts = {};
  for (const char of myCharacters) {
    animeCounts[char.anime] = (animeCounts[char.anime] || 0) + 1;
  }
  
  // Find active synergies
  const synergies = [];
  for (const [anime, count] of Object.entries(animeCounts)) {
    if (count >= 2) {
      const bonusPercent = count >= 4 ? 20 : count >= 3 ? 12 : 5;
      synergies.push({ anime, count, bonusPercent });
    }
  }
  
  // Update or create synergy display
  let synergyContainer = document.getElementById('synergyPreview');
  if (!synergyContainer) {
    const teamPreview = document.querySelector('.team-preview');
    if (teamPreview) {
      synergyContainer = document.createElement('div');
      synergyContainer.id = 'synergyPreview';
      synergyContainer.className = 'synergy-preview';
      teamPreview.appendChild(synergyContainer);
    }
  }
  
  if (synergyContainer) {
    if (synergies.length === 0) {
      synergyContainer.innerHTML = '';
    } else {
      synergyContainer.innerHTML = `
        <div class="synergy-title">🔗 Active Synergies</div>
        ${synergies.map(s => `
          <div class="synergy-item">
            <span class="synergy-anime">${s.anime}</span>
            <span class="synergy-count">×${s.count}</span>
            <span class="synergy-bonus">+${s.bonusPercent}%</span>
          </div>
        `).join('')}
      `;
    }
  }
}

function updateAllPlayersStatus(players, currentPlayerId) {
  const container = document.getElementById('allPlayersStatus');
  
  container.innerHTML = players.map(player => `
    <div class="player-status-card ${player.id === currentPlayerId ? 'current-turn' : ''}">
      <div class="player-status-name">${player.name} ${player.id === myPlayerId ? '(You)' : ''}</div>
      <div class="player-status-spins">${'🎰'.repeat(player.spinsLeft)} ${player.spinsLeft > 0 ? '' : '✅'}</div>
      <div class="player-status-chars">
        ${player.characters.map(char => {
          const rarity = char.rarity || { key: 'common', color: '#9CA3AF' };
          const rarityStyle = rarityConfig[rarity.key] || rarityConfig.common;
          return `
            <div class="mini-char ${rarity.key}" style="border-color: ${rarityStyle.color}; box-shadow: ${rarityStyle.glow}" title="${char.name} (${rarity.name})">
              ${characterEmojis[char.name] || '⭐'}
            </div>
          `;
        }).join('') || '<span style="opacity: 0.5; font-size: 0.8rem">No chars yet</span>'}
      </div>
    </div>
  `).join('');
}

function spin() {
  if (!isMyTurn) return;
  socket.emit('spin');
  
  // Play sound through audio manager or fallback
  if (window.audioManager) {
    window.audioManager.play('spin');
  } else {
    try {
      document.getElementById('spinSound').currentTime = 0;
      document.getElementById('spinSound').play();
    } catch (e) {}
  }
}

function animateRoulette(targetIndex) {
  // Animate both player and spectator roulettes
  const containers = [
    document.getElementById('rouletteItems'),
    document.getElementById('spectatorRouletteItems')
  ].filter(c => c);
  
  const itemWidth = 120;
  
  containers.forEach(container => {
    // Calculate position (aim for middle of roulette, with some randomness)
    const baseOffset = characters.length * 5 * itemWidth; // 5 full rotations
    const targetOffset = baseOffset + (targetIndex * itemWidth) + (itemWidth / 2) - 300;
    
    container.style.transition = 'none';
    container.style.transform = 'translateX(0)';
    
    // Force reflow
    container.offsetHeight;
    
    // Animate
    container.style.transition = 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
    container.style.transform = `translateX(-${targetOffset}px)`;
    
    // Reset after animation
    setTimeout(() => {
      container.style.transition = 'none';
      container.style.transform = 'translateX(0)';
    }, 4500);
  });
}

function showBattleResults(battleData) {
  showScreen('battle');
  
  const showdownContainer = document.getElementById('battleShowdown');
  const arena = document.getElementById('battleArena');
  const winnerSection = document.getElementById('winnerAnnouncement');
  
  // Play battle animation with sound
  if (window.battleAnimator && battleData.players.length >= 2) {
    // Show animated showdown first
    window.playBattleShowdown(battleData, 'battleShowdown').then(() => {
      // After animation, render full battle arena
      renderBattleArena(arena, winnerSection, battleData);
    });
    
    // Play battle sounds through audio manager
    if (window.audioManager) {
      window.audioManager.playBattleSequence();
    }
  } else {
    // Fallback: just render arena
    if (showdownContainer) showdownContainer.innerHTML = '';
    renderBattleArena(arena, winnerSection, battleData);
    
    // Play win sound
    try {
      document.getElementById('winSound').play();
    } catch (e) {}
  }
}

function showSpectatorBattleResults(battleData) {
  const content = document.getElementById('spectatorContent');
  
  content.innerHTML = `
    <h2 class="battle-title">⚔️ BATTLE RESULTS ⚔️</h2>
    <div id="spectatorBattleShowdown" class="battle-showdown"></div>
    <div id="spectatorBattleArena" class="battle-arena"></div>
    <div id="spectatorWinnerAnnouncement" class="winner-announcement"></div>
  `;
  
  const arena = document.getElementById('spectatorBattleArena');
  const winnerSection = document.getElementById('spectatorWinnerAnnouncement');
  
  // Play animated showdown for spectators too
  if (window.battleAnimator && battleData.players.length >= 2) {
    window.playBattleShowdown(battleData, 'spectatorBattleShowdown').then(() => {
      renderBattleArena(arena, winnerSection, battleData);
    });
    
    if (window.audioManager) {
      window.audioManager.playBattleSequence();
    }
  } else {
    renderBattleArena(arena, winnerSection, battleData);
  }
}

function renderBattleArena(arena, winnerSection, battleData) {
  // Build battle arena with enhanced visuals
  arena.innerHTML = battleData.players.map((player, index) => {
    const isWinner = index === 0;
    const rank = index === 0 ? '🥇 1st' : index === 1 ? '🥈 2nd' : index === 2 ? '🥉 3rd' : `${index + 1}th`;
    const hasSynergy = player.synergies && player.synergies.length > 0;
    
    return `
      <div class="battle-player ${isWinner ? 'winner' : ''}" style="animation-delay: ${index * 0.2}s">
        <div class="battle-player-name">${player.name}</div>
        <div class="battle-player-rank">${rank}</div>
        <div class="battle-player-chars">
          ${player.characters.map(char => {
            const rarity = char.rarity || { key: 'common', name: 'Common', color: '#9CA3AF' };
            const rarityStyle = rarityConfig[rarity.key] || rarityConfig.common;
            const charEmoji = characterEmojis[char.name] || '⭐';
            return `
              <div class="battle-char ${rarity.key === 'legendary' ? 'legendary' : ''} ${rarity.key === 'epic' ? 'epic' : ''}" style="--char-color: ${char.color}">
                <div class="battle-char-rarity" style="background: ${rarityStyle.color}">${rarity.name}</div>
                <div class="battle-char-icon" style="border-color: ${rarityStyle.color}; box-shadow: ${rarityStyle.glow}">
                  <span class="battle-char-emoji">${charEmoji}</span>
                </div>
                <div class="battle-char-name">${char.name}</div>
                <div class="battle-char-power">⚡${char.power.toLocaleString()}</div>
              </div>
            `;
          }).join('')}
        </div>
        <div class="battle-power-breakdown">
          <div class="battle-base-power">Base: ⚡${(player.basePower || player.totalPower).toLocaleString()}</div>
          ${hasSynergy ? `
            <div class="battle-synergy-bonus">
              <div class="synergy-bonus-label">🔗 Synergy Bonuses:</div>
              ${player.synergies.map(s => `
                <div class="synergy-bonus-item">
                  ${s.anime} (×${s.count}): +${s.bonusPercent}% (+${s.bonusAmount.toLocaleString()})
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
        <div class="battle-total-power">⚡ ${player.totalPower.toLocaleString()}</div>
        <div class="battle-total-label">Total Power${hasSynergy ? ' (with synergy)' : ''}</div>
      </div>
    `;
  }).join('');
  
  // Winner announcement with synergy callout
  const winnerSynergy = battleData.winner.synergyBonus > 0 
    ? ` (including +${battleData.winner.synergyBonus.toLocaleString()} synergy bonus!)` 
    : '';
  
  winnerSection.innerHTML = `
    <div class="winner-text">🏆 WINNER 🏆</div>
    <div class="winner-name">${battleData.winner.name} wins with ${battleData.winner.totalPower.toLocaleString()} power${winnerSynergy}</div>
  `;
}

function shareResults() {
  const shareId = window.currentBattleData?.shareId;
  if (!shareId) {
    showToast('No results to share!');
    return;
  }
  
  const shareUrl = `${window.location.origin}?share=${shareId}`;
  
  if (navigator.share) {
    navigator.share({
      title: 'Anime Death Battle Results!',
      text: `${window.currentBattleData.winner.name} won with ${window.currentBattleData.winner.totalPower} power! Check out the battle:`,
      url: shareUrl
    }).catch(() => {
      copyShareLink(shareUrl);
    });
  } else {
    copyShareLink(shareUrl);
  }
}

function copyShareLink(url) {
  navigator.clipboard.writeText(url).then(() => {
    showToast('Share link copied to clipboard!');
  }).catch(() => {
    showToast('Could not copy link');
  });
}

async function loadSharedResults(shareId) {
  try {
    const response = await fetch(`/api/results/${shareId}`);
    if (!response.ok) throw new Error('Results not found');
    
    const battleData = await response.json();
    showScreen('results');
    
    const arena = document.getElementById('sharedBattleArena');
    const winnerSection = document.getElementById('sharedWinner');
    
    renderBattleArena(arena, winnerSection, battleData);
  } catch (error) {
    showToast('Could not load shared results');
    window.location.href = '/';
  }
}

function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.style.borderColor = type === 'error' ? 'var(--primary)' : 'var(--secondary)';
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function leaveRoom() {
  // Disconnect and reconnect to leave the room cleanly
  socket.disconnect();
  socket.connect();
  
  // Reset state
  currentRoom = null;
  isSpectator = false;
  isMyTurn = false;
  characters = [];
  selectedGameMode = 'classic';
  currentDraftState = null;
  survivalWave = 1;
  
  // Clear chat messages
  ['chatMessages', 'gameChatMessages', 'battleChatMessages', 'spectatorChatMessages', 'draftChatMessages', 'survivalChatMessages'].forEach(id => {
    const container = document.getElementById(id);
    if (container) container.innerHTML = '';
  });
  
  // Reset ready button
  const readyBtn = document.getElementById('readyBtn');
  if (readyBtn) {
    readyBtn.disabled = false;
    readyBtn.textContent = '✅ Ready!';
  }
  
  // Go back to menu
  showScreen('menu');
  showToast('Left the room');
}

// Make function available globally for onclick handlers
window.joinRoomFromBrowser = joinRoomFromBrowser;

// =============================================
// DRAFT MODE FUNCTIONS
// =============================================

function setupDraftUI(draftState) {
  const draftScreen = document.getElementById('draftScreen');
  if (!draftScreen) return;
  
  updateDraftUI(draftState);
}

function updateDraftUI(draftState) {
  const isMyDraftTurn = draftState.currentDrafter === myPlayerId;
  
  // Update turn indicator
  const turnIndicator = document.getElementById('draftTurnIndicator');
  if (turnIndicator) {
    if (isMyDraftTurn) {
      turnIndicator.textContent = "🎯 YOUR TURN TO PICK!";
      turnIndicator.className = 'turn-indicator your-turn';
    } else {
      turnIndicator.textContent = `⏳ ${draftState.currentDrafterName}'s turn to pick`;
      turnIndicator.className = 'turn-indicator';
    }
  }
  
  // Update round info
  const roundInfo = document.getElementById('draftRoundInfo');
  if (roundInfo) {
    roundInfo.textContent = `Round ${draftState.draftRound} | Pick ${draftState.picksPerPlayer - (draftState.players.find(p => p.id === myPlayerId)?.picksLeft || 0) + 1}/${draftState.picksPerPlayer}`;
  }
  
  // Update available pool
  const poolContainer = document.getElementById('draftPool');
  if (poolContainer) {
    poolContainer.innerHTML = draftState.availablePool.map(char => {
      const rarityStyle = rarityConfig[char.rarity?.key] || rarityConfig.common;
      const isClickable = isMyDraftTurn;
      
      return `
        <div class="draft-char ${isClickable ? 'clickable' : 'disabled'} ${char.rarity?.key || 'common'}" 
             style="border-color: ${rarityStyle.color}; box-shadow: ${rarityStyle.glow}"
             ${isClickable ? `onclick="draftPick(${char.id})"` : ''}>
          <div class="rarity-badge" style="background: ${rarityStyle.color}">${char.rarity?.name || 'Common'}</div>
          <div class="draft-char-icon">
            ${characterEmojis[char.name] || '⭐'}
          </div>
          <div class="draft-char-name">${char.name}</div>
          <div class="draft-char-anime">${char.anime}</div>
          <div class="draft-char-power">⚡ ${char.power.toLocaleString()}</div>
        </div>
      `;
    }).join('');
  }
  
  // Update all players' picks
  const playersContainer = document.getElementById('draftPlayers');
  if (playersContainer) {
    playersContainer.innerHTML = draftState.players.map(player => `
      <div class="draft-player ${player.id === draftState.currentDrafter ? 'current-turn' : ''} ${player.id === myPlayerId ? 'is-you' : ''}">
        <div class="draft-player-name">${player.name} ${player.id === myPlayerId ? '(You)' : ''}</div>
        <div class="draft-player-picks-left">Picks left: ${player.picksLeft}</div>
        <div class="draft-player-chars">
          ${player.characters.length > 0 ? player.characters.map(char => {
            const rarityStyle = rarityConfig[char.rarity?.key] || rarityConfig.common;
            return `
              <div class="mini-char ${char.rarity?.key}" style="border-color: ${rarityStyle.color}; box-shadow: ${rarityStyle.glow}" title="${char.name} (${char.rarity?.name})">
                ${characterEmojis[char.name] || '⭐'}
              </div>
            `;
          }).join('') : '<span style="opacity: 0.5; font-size: 0.8rem">No picks yet</span>'}
        </div>
      </div>
    `).join('');
  }
}

function draftPick(characterId) {
  socket.emit('draftPick', { characterId });
}

window.draftPick = draftPick;

// =============================================
// SURVIVAL MODE FUNCTIONS
// =============================================

function showSurvivalResults(battleData) {
  showScreen('survival');
  
  const survivalScreen = document.getElementById('survivalScreen');
  if (!survivalScreen) return;
  
  const arena = document.getElementById('survivalArena');
  const resultSection = document.getElementById('survivalResult');
  const actionsSection = document.getElementById('survivalActions');
  
  if (!arena || !resultSection || !actionsSection) return;
  
  // Play appropriate sound
  try {
    if (battleData.playerWins) {
      document.getElementById('winSound').play();
    }
  } catch (e) {}
  
  // Build arena showing player vs AI
  arena.innerHTML = `
    <div class="survival-header">
      <div class="wave-info">
        <div class="wave-number">WAVE ${battleData.wave}</div>
        <div class="wave-difficulty ${battleData.difficulty.toLowerCase()}">${battleData.difficulty}</div>
      </div>
    </div>
    
    <div class="survival-battle">
      <!-- Player Side -->
      <div class="survival-combatant player-side ${battleData.playerWins ? 'winner' : 'loser'}">
        <div class="combatant-label">YOUR TEAM</div>
        <div class="combatant-chars">
          ${battleData.player.characters.map(char => {
            const rarity = char.rarity || { key: 'common', name: 'Common' };
            const rarityStyle = rarityConfig[rarity.key] || rarityConfig.common;
            return `
              <div class="battle-char ${rarity.key === 'legendary' ? 'legendary' : ''}" style="border-color: ${rarityStyle.color}">
                <div class="battle-char-icon">${characterEmojis[char.name] || '⭐'}</div>
                <div class="battle-char-name">${char.name}</div>
                <div class="battle-char-power">⚡${char.power}</div>
              </div>
            `;
          }).join('')}
        </div>
        <div class="combatant-power">
          <div class="power-breakdown">
            <span>Base: ⚡${battleData.player.basePower.toLocaleString()}</span>
            ${battleData.player.synergyBonus > 0 ? `<span class="synergy-bonus">+${battleData.player.synergyBonus.toLocaleString()} synergy</span>` : ''}
          </div>
          <div class="total-power">⚡ ${battleData.player.totalPower.toLocaleString()}</div>
        </div>
      </div>
      
      <!-- VS -->
      <div class="survival-vs">
        <span class="vs-text">VS</span>
      </div>
      
      <!-- AI Side -->
      <div class="survival-combatant ai-side ${!battleData.playerWins ? 'winner' : 'loser'}">
        <div class="combatant-label">${battleData.ai.name}</div>
        <div class="combatant-chars">
          ${battleData.ai.characters.map(char => {
            const rarity = char.rarity || { key: 'common', name: 'Common' };
            const rarityStyle = rarityConfig[rarity.key] || rarityConfig.common;
            return `
              <div class="battle-char ${rarity.key === 'legendary' ? 'legendary' : ''}" style="border-color: ${rarityStyle.color}">
                <div class="battle-char-icon">${characterEmojis[char.name] || '⭐'}</div>
                <div class="battle-char-name">${char.name}</div>
                <div class="battle-char-power">⚡${char.power}</div>
              </div>
            `;
          }).join('')}
        </div>
        <div class="combatant-power">
          <div class="power-breakdown">
            <span>Scaled Power (${Math.round(battleData.ai.scaling * 100)}%)</span>
          </div>
          <div class="total-power">⚡ ${battleData.ai.totalPower.toLocaleString()}</div>
        </div>
      </div>
    </div>
  `;
  
  // Show result
  if (battleData.playerWins) {
    resultSection.innerHTML = `
      <div class="survival-victory">
        <div class="result-icon">🏆</div>
        <div class="result-text">VICTORY!</div>
        <div class="result-sub">You defeated Wave ${battleData.wave}!</div>
      </div>
    `;
    actionsSection.innerHTML = `
      <button id="survivalContinueBtn" class="btn btn-primary btn-large">⚔️ Continue to Wave ${battleData.nextWave}</button>
      <button id="survivalShareBtn" class="btn btn-secondary">📤 Share</button>
      <button id="survivalRematchBtn" class="btn btn-secondary">🔄 New Run</button>
      <button id="survivalLeaveBtn" class="btn btn-secondary">🚪 Leave</button>
    `;
    
    // Add event listeners
    document.getElementById('survivalContinueBtn').addEventListener('click', () => {
      socket.emit('survivalContinue');
    });
  } else {
    resultSection.innerHTML = `
      <div class="survival-defeat">
        <div class="result-icon">💀</div>
        <div class="result-text">DEFEATED!</div>
        <div class="result-sub">You reached Wave ${battleData.wave}</div>
        <div class="final-score">Final Score: ${battleData.wave - 1} waves cleared</div>
      </div>
    `;
    actionsSection.innerHTML = `
      <button id="survivalShareBtn" class="btn btn-primary">📤 Share Results</button>
      <button id="survivalRematchBtn" class="btn btn-secondary">🔄 Try Again</button>
      <button id="survivalLeaveBtn" class="btn btn-secondary">🚪 Leave</button>
    `;
  }
  
  // Common event listeners
  document.getElementById('survivalShareBtn')?.addEventListener('click', shareResults);
  document.getElementById('survivalRematchBtn')?.addEventListener('click', () => {
    socket.emit('requestRematch');
  });
  document.getElementById('survivalLeaveBtn')?.addEventListener('click', leaveRoom);
}

// =============================================
// UPDATE LOBBY FOR GAME MODES
// =============================================

function updateLobby(players, spectators, maxPlayers, gameMode) {
  // Update player count
  const modeText = gameMode === 'survival' ? '(Solo)' : gameMode === 'draft' ? '(Draft)' : '';
  document.getElementById('playerCountDisplay').textContent = `👥 ${players.length}/${maxPlayers} Players ${modeText}`;
  document.getElementById('spectatorCountDisplay').textContent = `👁️ ${spectators.length} Spectators`;
  
  // Show game mode badge
  const lobbyHeader = document.querySelector('.lobby-header');
  let modeBadge = document.getElementById('gameModeBadge');
  if (!modeBadge && lobbyHeader) {
    modeBadge = document.createElement('div');
    modeBadge.id = 'gameModeBadge';
    modeBadge.className = 'game-mode-badge';
    lobbyHeader.appendChild(modeBadge);
  }
  if (modeBadge) {
    const modeConfig = {
      classic: { icon: '🎰', name: 'Classic', color: '#22C55E' },
      survival: { icon: '💀', name: 'Survival', color: '#EF4444' },
      draft: { icon: '📋', name: 'Draft', color: '#3B82F6' }
    };
    const mode = modeConfig[gameMode] || modeConfig.classic;
    modeBadge.innerHTML = `<span style="color: ${mode.color}">${mode.icon} ${mode.name} Mode</span>`;
  }
  
  // Update players list
  const container = document.getElementById('playersList');
  container.innerHTML = players.map(player => `
    <div class="player-card ${player.ready ? 'ready' : ''} ${player.id === myPlayerId ? 'is-you' : ''}">
      <div class="player-name">${player.name} ${player.id === myPlayerId ? '(You)' : ''}</div>
      <div class="player-status ${player.ready ? 'ready' : ''}">${player.ready ? '✅ Ready' : '⏳ Waiting...'}</div>
    </div>
  `).join('');
  
  // Update spectators
  updateSpectatorsList(spectators);
  
  // Update waiting text based on game mode
  const waitingText = document.querySelector('.waiting-text');
  const minPlayers = gameMode === 'survival' ? 1 : 2;
  
  if (players.length < minPlayers) {
    waitingText.textContent = gameMode === 'survival' 
      ? 'Click Ready to start your survival run!' 
      : `Waiting for more players... (need at least ${minPlayers})`;
  } else if (players.every(p => p.ready)) {
    waitingText.textContent = 'Starting game...';
  } else {
    waitingText.textContent = `${players.filter(p => p.ready).length}/${players.length} players ready`;
  }
}

// Update rooms list to show game mode
function renderRoomsList(rooms) {
  const container = document.getElementById('roomsList');
  
  if (rooms.length === 0) {
    container.innerHTML = '<p class="no-rooms">No active rooms. Create one!</p>';
    return;
  }
  
  const modeIcons = {
    classic: '🎰',
    survival: '💀',
    draft: '📋'
  };
  
  container.innerHTML = rooms.map(room => `
    <div class="room-card">
      <div class="room-info">
        <div class="room-host">${modeIcons[room.gameMode] || '🎮'} ${room.hostName}'s Room</div>
        <div class="room-mode">${(room.gameMode || 'classic').charAt(0).toUpperCase() + (room.gameMode || 'classic').slice(1)} Mode</div>
        <div class="room-details">
          👥 ${room.playerCount}/${room.maxPlayers} players 
          ${room.spectatorCount > 0 ? `| 👁️ ${room.spectatorCount} spectators` : ''}
        </div>
      </div>
      <div class="room-actions">
        ${room.playerCount < room.maxPlayers ? 
          `<button class="btn btn-primary btn-small" onclick="joinRoomFromBrowser('${room.code}')">Join</button>` : 
          ''}
        <button class="btn btn-secondary btn-small" onclick="joinRoomFromBrowser('${room.code}', true)">👁️ Watch</button>
      </div>
    </div>
  `).join('');
}
