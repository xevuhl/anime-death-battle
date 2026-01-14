// Client-side Configuration
// This file contains display settings for characters and rarities

// Character emoji mapping
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

// Rarity display configuration (colors and effects)
const rarityConfig = {
  common: {
    color: '#9CA3AF',
    name: 'Common',
    glow: 'none'
  },
  uncommon: {
    color: '#22C55E',
    name: 'Uncommon',
    glow: '0 0 15px rgba(34, 197, 94, 0.5)'
  },
  rare: {
    color: '#3B82F6',
    name: 'Rare',
    glow: '0 0 20px rgba(59, 130, 246, 0.6)'
  },
  epic: {
    color: '#A855F7',
    name: 'Epic',
    glow: '0 0 25px rgba(168, 85, 247, 0.7)'
  },
  legendary: {
    color: '#F59E0B',
    name: 'Legendary',
    glow: '0 0 30px rgba(245, 158, 11, 0.8), 0 0 60px rgba(245, 158, 11, 0.4)'
  }
};

// Synergy bonus percentages (for display)
const synergyDisplayConfig = {
  2: { percent: 5, description: '2 characters = +5%' },
  3: { percent: 12, description: '3 characters = +12%' },
  4: { percent: 20, description: '4+ characters = +20%' }
};

// Make available globally
window.GameConfig = {
  characterEmojis,
  rarityConfig,
  synergyDisplayConfig
};
