// Synergy Bonus Configuration
// Bonus power when collecting multiple characters from the same anime

const synergyBonuses = {
  2: 0.05,  // 2 characters from same anime = +5%
  3: 0.12,  // 3 characters from same anime = +12%
  4: 0.20   // 4+ characters from same anime = +20%
};

// Calculate synergy bonus for a player's team
function calculateSynergyBonus(characters) {
  // Count characters by anime
  const animeCounts = {};
  for (const char of characters) {
    animeCounts[char.anime] = (animeCounts[char.anime] || 0) + 1;
  }
  
  // Calculate total synergy bonus
  let totalBonus = 0;
  const synergies = [];
  
  for (const [anime, count] of Object.entries(animeCounts)) {
    if (count >= 2) {
      const bonusKey = Math.min(count, 4); // Cap at 4 for max bonus
      const bonusPercent = synergyBonuses[bonusKey] || synergyBonuses[4];
      const animeChars = characters.filter(c => c.anime === anime);
      const animePower = animeChars.reduce((sum, c) => sum + c.power, 0);
      const bonusAmount = Math.floor(animePower * bonusPercent);
      
      totalBonus += bonusAmount;
      synergies.push({
        anime,
        count,
        bonusPercent: Math.round(bonusPercent * 100),
        bonusAmount
      });
    }
  }
  
  return { totalBonus, synergies };
}

module.exports = {
  synergyBonuses,
  calculateSynergyBonus
};
