// Rarity Tiers Configuration
// Characters are auto-assigned rarity based on power level

const rarityTiers = {
  common: {
    minPower: 0,
    maxPower: 7500,
    weight: 40,        // Higher weight = more common
    color: '#9CA3AF',
    name: 'Common'
  },
  uncommon: {
    minPower: 7501,
    maxPower: 8200,
    weight: 30,
    color: '#22C55E',
    name: 'Uncommon'
  },
  rare: {
    minPower: 8201,
    maxPower: 8800,
    weight: 18,
    color: '#3B82F6',
    name: 'Rare'
  },
  epic: {
    minPower: 8801,
    maxPower: 9400,
    weight: 9,
    color: '#A855F7',
    name: 'Epic'
  },
  legendary: {
    minPower: 9401,
    maxPower: 10000,
    weight: 3,
    color: '#F59E0B',
    name: 'Legendary'
  }
};

// Get rarity for a character based on power
function getCharacterRarity(character) {
  for (const [key, tier] of Object.entries(rarityTiers)) {
    if (character.power >= tier.minPower && character.power <= tier.maxPower) {
      return { key, ...tier };
    }
  }
  return { key: 'common', ...rarityTiers.common };
}

module.exports = {
  rarityTiers,
  getCharacterRarity
};
