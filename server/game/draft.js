// Draft Mode System
// Players take turns picking from a shared pool of characters

const characters = require('../config/characters');
const { getCharacterRarity } = require('../config/rarities');

// Draft pool size based on player count
const PICKS_PER_PLAYER = 3;
const EXTRA_POOL_MULTIPLIER = 1.5; // Pool = players * picks * multiplier

// Generate a draft pool for the room
function generateDraftPool(playerCount) {
  const poolSize = Math.min(
    Math.floor(playerCount * PICKS_PER_PLAYER * EXTRA_POOL_MULTIPLIER),
    characters.length
  );
  
  // Shuffle and select characters for the pool
  const shuffled = [...characters].sort(() => Math.random() - 0.5);
  const pool = shuffled.slice(0, poolSize);
  
  // Add rarity info to each character
  return pool.map(char => ({
    ...char,
    rarity: getCharacterRarity(char),
    drafted: false,
    draftedBy: null
  }));
}

// Get available (undrafted) characters from pool
function getAvailablePool(draftPool) {
  return draftPool.filter(char => !char.drafted);
}

// Draft a character from the pool
function draftCharacter(draftPool, characterId, playerId) {
  const charIndex = draftPool.findIndex(c => c.id === characterId && !c.drafted);
  
  if (charIndex === -1) {
    return { success: false, error: "Character not available" };
  }
  
  draftPool[charIndex].drafted = true;
  draftPool[charIndex].draftedBy = playerId;
  
  return {
    success: true,
    character: { ...draftPool[charIndex] }
  };
}

// Calculate next drafter in snake draft order
// Snake draft: 1,2,3,4 -> 4,3,2,1 -> 1,2,3,4 -> etc
function getNextDrafter(currentIndex, playerCount, round) {
  const isEvenRound = round % 2 === 0;
  
  if (isEvenRound) {
    // Reverse order
    if (currentIndex === 0) {
      return { index: 0, round: round + 1 }; // Start new round
    }
    return { index: currentIndex - 1, round };
  } else {
    // Forward order
    if (currentIndex === playerCount - 1) {
      return { index: playerCount - 1, round: round + 1 }; // Start new round (same player goes again)
    }
    return { index: currentIndex + 1, round };
  }
}

// Check if draft is complete
function isDraftComplete(players, picksPerPlayer = PICKS_PER_PLAYER) {
  return players.every(p => p.characters.length >= picksPerPlayer);
}

// Get draft state summary for clients
function getDraftState(room) {
  return {
    currentDrafter: room.players[room.currentPlayerIndex]?.id,
    currentDrafterName: room.players[room.currentPlayerIndex]?.name,
    draftRound: room.draftRound || 1,
    picksPerPlayer: PICKS_PER_PLAYER,
    availablePool: getAvailablePool(room.draftPool || []),
    fullPool: room.draftPool || [],
    players: room.players.map(p => ({
      id: p.id,
      name: p.name,
      characters: p.characters,
      picksLeft: PICKS_PER_PLAYER - p.characters.length
    }))
  };
}

module.exports = {
  generateDraftPool,
  getAvailablePool,
  draftCharacter,
  getNextDrafter,
  isDraftComplete,
  getDraftState,
  PICKS_PER_PLAYER
};
