// Survival Mode System
// Player faces increasingly difficult AI opponents while keeping their team

const characters = require('../config/characters');
const { getCharacterRarity } = require('../config/rarities');
const { calculateSynergyBonus } = require('../config/synergies');

// AI difficulty scaling per wave
const difficultyScaling = {
  1: { powerMultiplier: 0.7, teamSize: 2, name: "Rookie" },
  2: { powerMultiplier: 0.85, teamSize: 2, name: "Novice" },
  3: { powerMultiplier: 1.0, teamSize: 3, name: "Skilled" },
  4: { powerMultiplier: 1.1, teamSize: 3, name: "Veteran" },
  5: { powerMultiplier: 1.25, teamSize: 3, name: "Elite" },
  6: { powerMultiplier: 1.4, teamSize: 4, name: "Master" },
  7: { powerMultiplier: 1.55, teamSize: 4, name: "Champion" },
  8: { powerMultiplier: 1.7, teamSize: 4, name: "Legendary" },
  9: { powerMultiplier: 1.9, teamSize: 5, name: "Mythical" },
  10: { powerMultiplier: 2.1, teamSize: 5, name: "Godlike" }
};

// Boss names for flavor
const bossNames = [
  "Shadow Fighter", "Dark Champion", "Void Walker", "Chaos Lord",
  "Doom Bringer", "Death Knight", "Nightmare King", "Eternal Warrior",
  "Apocalypse", "The Final Boss"
];

// Generate AI team for a specific wave
function generateAITeam(wave, playerPower) {
  const scaling = difficultyScaling[Math.min(wave, 10)];
  const targetPower = playerPower * scaling.powerMultiplier;
  
  // Select characters for AI team
  const availableChars = [...characters];
  const aiTeam = [];
  const teamSize = scaling.teamSize;
  
  // Sort by power to help meet target
  availableChars.sort((a, b) => b.power - a.power);
  
  // Pick characters that get us close to target power
  let currentPower = 0;
  const targetPerChar = targetPower / teamSize;
  
  for (let i = 0; i < teamSize; i++) {
    // Find a character close to target per character
    let bestChar = availableChars[Math.floor(Math.random() * Math.min(15, availableChars.length))];
    
    // For later waves, prefer stronger characters
    if (wave >= 5) {
      const strongChars = availableChars.filter(c => c.power > 8500);
      if (strongChars.length > 0) {
        bestChar = strongChars[Math.floor(Math.random() * strongChars.length)];
      }
    }
    
    const charWithRarity = {
      ...bestChar,
      rarity: getCharacterRarity(bestChar)
    };
    
    aiTeam.push(charWithRarity);
    
    // Remove from available to avoid duplicates
    const index = availableChars.findIndex(c => c.id === bestChar.id);
    if (index > -1) {
      availableChars.splice(index, 1);
    }
  }
  
  return aiTeam;
}

// Calculate survival battle between player and AI
function calculateSurvivalBattle(playerCharacters, wave) {
  // Calculate player power
  const playerBasePower = playerCharacters.reduce((sum, char) => sum + char.power, 0);
  const playerSynergy = calculateSynergyBonus(playerCharacters);
  const playerTotalPower = playerBasePower + playerSynergy.totalBonus;
  
  // Generate AI team
  const aiTeam = generateAITeam(wave, playerTotalPower);
  const aiBasePower = aiTeam.reduce((sum, char) => sum + char.power, 0);
  const aiSynergy = calculateSynergyBonus(aiTeam);
  const aiTotalPower = aiBasePower + aiSynergy.totalBonus;
  
  // Apply wave scaling to AI power
  const scaling = difficultyScaling[Math.min(wave, 10)];
  const scaledAiPower = Math.floor(aiTotalPower * scaling.powerMultiplier);
  
  // Determine winner
  const playerWins = playerTotalPower > scaledAiPower;
  
  return {
    wave,
    difficulty: scaling.name,
    bossName: bossNames[Math.min(wave - 1, bossNames.length - 1)],
    player: {
      characters: playerCharacters,
      basePower: playerBasePower,
      synergyBonus: playerSynergy.totalBonus,
      synergies: playerSynergy.synergies,
      totalPower: playerTotalPower
    },
    ai: {
      name: `Wave ${wave}: ${bossNames[Math.min(wave - 1, bossNames.length - 1)]}`,
      characters: aiTeam,
      basePower: aiBasePower,
      synergyBonus: aiSynergy.totalBonus,
      synergies: aiSynergy.synergies,
      totalPower: scaledAiPower,
      rawPower: aiTotalPower,
      scaling: scaling.powerMultiplier
    },
    playerWins,
    isGameOver: !playerWins,
    nextWave: playerWins ? wave + 1 : null
  };
}

// Get difficulty info for display
function getDifficultyInfo() {
  return Object.entries(difficultyScaling).map(([wave, info]) => ({
    wave: parseInt(wave),
    ...info
  }));
}

module.exports = {
  generateAITeam,
  calculateSurvivalBattle,
  getDifficultyInfo,
  difficultyScaling,
  bossNames
};
