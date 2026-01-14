// Utility Functions

// Show toast notification
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Copy text to clipboard
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    return false;
  }
}

// Play sound effect
function playSound(soundId) {
  try {
    const sound = document.getElementById(soundId);
    if (sound) {
      sound.currentTime = 0;
      sound.play();
    }
  } catch (e) {
    // Sound play failed, ignore
  }
}

// Format number with commas
function formatNumber(num) {
  return num.toLocaleString();
}

// Get character emoji
function getCharacterEmoji(name) {
  return window.GameConfig.characterEmojis[name] || '⭐';
}

// Get rarity config
function getRarityConfig(rarityKey) {
  return window.GameConfig.rarityConfig[rarityKey] || window.GameConfig.rarityConfig.common;
}

// Make utilities globally available
window.GameUtils = {
  showToast,
  copyToClipboard,
  playSound,
  formatNumber,
  getCharacterEmoji,
  getRarityConfig
};
