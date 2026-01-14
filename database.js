const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_FILE = path.join(__dirname, 'data.json');

// Initialize data structure
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      return data;
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
  return { users: {}, matches: [] };
}

function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

// User functions
function findOrCreateUser(profile, provider) {
  const data = loadData();
  const providerKey = `${provider}_${profile.id}`;
  
  // Check if user exists
  let user = Object.values(data.users).find(u => 
    u.provider === provider && u.provider_id === profile.id
  );
  
  if (user) {
    user.last_login = new Date().toISOString();
    saveData(data);
    return user;
  }
  
  // Create new user
  const userId = uuidv4();
  const email = profile.emails?.[0]?.value || null;
  const displayName = profile.displayName || profile.name?.givenName || 'Player';
  const avatarUrl = profile.photos?.[0]?.value || null;
  
  user = {
    id: userId,
    provider: provider,
    provider_id: profile.id,
    email: email,
    display_name: displayName,
    avatar_url: avatarUrl,
    wins: 0,
    losses: 0,
    games_played: 0,
    total_power_collected: 0,
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString()
  };
  
  data.users[userId] = user;
  saveData(data);
  
  return user;
}

function getUserById(id) {
  const data = loadData();
  return data.users[id] || null;
}

function updateUserStats(userId, won, totalPower) {
  const data = loadData();
  const user = data.users[userId];
  
  if (user) {
    if (won) {
      user.wins = (user.wins || 0) + 1;
    } else {
      user.losses = (user.losses || 0) + 1;
    }
    user.games_played = (user.games_played || 0) + 1;
    user.total_power_collected = (user.total_power_collected || 0) + totalPower;
    saveData(data);
  }
}

function recordMatch(userId, roomCode, result, totalPower, characters, opponentNames) {
  const data = loadData();
  
  const match = {
    id: data.matches.length + 1,
    user_id: userId,
    room_code: roomCode,
    result: result,
    total_power: totalPower,
    characters: characters,
    opponent_names: opponentNames,
    played_at: new Date().toISOString()
  };
  
  data.matches.push(match);
  
  // Keep only last 1000 matches to prevent file from getting too large
  if (data.matches.length > 1000) {
    data.matches = data.matches.slice(-1000);
  }
  
  saveData(data);
}

function getLeaderboard(limit = 10) {
  const data = loadData();
  const users = Object.values(data.users);
  
  return users
    .sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      return b.total_power_collected - a.total_power_collected;
    })
    .slice(0, limit)
    .map(u => ({
      id: u.id,
      display_name: u.display_name,
      avatar_url: u.avatar_url,
      wins: u.wins,
      losses: u.losses,
      games_played: u.games_played,
      total_power_collected: u.total_power_collected
    }));
}

function getUserRank(userId) {
  const data = loadData();
  const user = data.users[userId];
  if (!user) return null;
  
  const users = Object.values(data.users);
  const sorted = users.sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    return b.total_power_collected - a.total_power_collected;
  });
  
  const rank = sorted.findIndex(u => u.id === userId) + 1;
  return rank || null;
}

function getUserMatchHistory(userId, limit = 10) {
  const data = loadData();
  return data.matches
    .filter(m => m.user_id === userId)
    .sort((a, b) => new Date(b.played_at) - new Date(a.played_at))
    .slice(0, limit);
}

module.exports = {
  findOrCreateUser,
  getUserById,
  updateUserStats,
  recordMatch,
  getLeaderboard,
  getUserRank,
  getUserMatchHistory
};
