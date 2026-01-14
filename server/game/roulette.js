// Weighted Character Selection (Roulette System)
const characters = require('../config/characters');
const { rarityTiers, getCharacterRarity } = require('../config/rarities');

// Select a random character using weighted rarity selection
function selectRandomCharacter() {
  // Group characters by rarity
  const charactersByRarity = {};
  for (const char of characters) {
    const rarity = getCharacterRarity(char);
    if (!charactersByRarity[rarity.key]) {
      charactersByRarity[rarity.key] = [];
    }
    charactersByRarity[rarity.key].push({ ...char, rarity });
  }
  
  // Calculate total weight
  const totalWeight = Object.entries(charactersByRarity).reduce((sum, [key, chars]) => {
    return sum + (rarityTiers[key].weight * chars.length);
  }, 0);
  
  // Random weighted selection
  let random = Math.random() * totalWeight;
  
  for (const [key, chars] of Object.entries(charactersByRarity)) {
    const tierWeight = rarityTiers[key].weight * chars.length;
    if (random < tierWeight) {
      // Select random character from this tier
      const char = chars[Math.floor(Math.random() * chars.length)];
      return char;
    }
    random -= tierWeight;
  }
  
  // Fallback to first character
  const fallback = characters[0];
  return { ...fallback, rarity: getCharacterRarity(fallback) };
}

// Get all characters with rarity info
function getCharactersWithRarity() {
  return characters.map(char => ({
    ...char,
    rarity: getCharacterRarity(char)
  }));
}

module.exports = {
  selectRandomCharacter,
  getCharactersWithRarity,
  characters
};
