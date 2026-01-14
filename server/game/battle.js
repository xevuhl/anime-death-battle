// Battle Calculation System
const { calculateSynergyBonus } = require('../config/synergies');

// Calculate battle results for a room
function calculateBattle(room) {
  const playerScores = room.players.map(player => {
    const basePower = player.characters.reduce((sum, char) => sum + char.power, 0);
    const { totalBonus, synergies } = calculateSynergyBonus(player.characters);
    const totalPower = basePower + totalBonus;
    
    return {
      id: player.id,
      name: player.name,
      characters: player.characters,
      basePower,
      synergyBonus: totalBonus,
      synergies,
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

module.exports = {
  calculateBattle
};
