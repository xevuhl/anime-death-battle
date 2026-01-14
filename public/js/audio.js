// Audio Manager for Anime Death Battle
// Handles all game sound effects and music

class AudioManager {
  constructor() {
    this.sounds = {};
    this.musicVolume = 0.3;
    this.sfxVolume = 0.5;
    this.enabled = true;
    this.initialized = false;
    
    this.init();
  }
  
  init() {
    // Define all sound effects
    this.soundSources = {
      // UI Sounds
      spin: 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3',
      spinStop: 'https://assets.mixkit.co/active_storage/sfx/270/270-preview.mp3',
      
      // Character Sounds
      characterReveal: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
      legendaryReveal: 'https://assets.mixkit.co/active_storage/sfx/1489/1489-preview.mp3',
      epicReveal: 'https://assets.mixkit.co/active_storage/sfx/2020/2020-preview.mp3',
      
      // Battle Sounds
      battleStart: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
      clash: 'https://assets.mixkit.co/active_storage/sfx/2785/2785-preview.mp3',
      powerUp: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
      explosion: 'https://assets.mixkit.co/active_storage/sfx/2805/2805-preview.mp3',
      
      // Result Sounds
      victory: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
      defeat: 'https://assets.mixkit.co/active_storage/sfx/2658/2658-preview.mp3',
      
      // UI Feedback
      click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
      hover: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
      ready: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
      
      // Chat/Notification
      message: 'https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3',
      notification: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'
    };
    
    this.initialized = true;
  }
  
  // Lazy load audio on first interaction
  async loadSound(name) {
    if (this.sounds[name]) return this.sounds[name];
    
    const src = this.soundSources[name];
    if (!src) return null;
    
    try {
      const audio = new Audio();
      audio.src = src;
      audio.volume = this.sfxVolume;
      audio.preload = 'auto';
      this.sounds[name] = audio;
      return audio;
    } catch (e) {
      console.warn(`Failed to load sound: ${name}`, e);
      return null;
    }
  }
  
  async play(name, options = {}) {
    if (!this.enabled) return;
    
    try {
      const audio = await this.loadSound(name);
      if (!audio) return;
      
      // Clone for overlapping sounds
      const sound = audio.cloneNode();
      sound.volume = options.volume ?? this.sfxVolume;
      
      if (options.loop) sound.loop = true;
      if (options.delay) {
        await new Promise(resolve => setTimeout(resolve, options.delay));
      }
      
      sound.currentTime = 0;
      await sound.play();
      
      return sound;
    } catch (e) {
      // Audio play failed - common on mobile without user interaction
      console.warn(`Audio play failed: ${name}`);
    }
  }
  
  stop(name) {
    if (this.sounds[name]) {
      this.sounds[name].pause();
      this.sounds[name].currentTime = 0;
    }
  }
  
  setVolume(type, volume) {
    if (type === 'sfx') {
      this.sfxVolume = volume;
    } else if (type === 'music') {
      this.musicVolume = volume;
    }
  }
  
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
  
  // Battle sequence audio
  async playBattleSequence() {
    await this.play('battleStart');
    await this.play('powerUp', { delay: 500 });
    await this.play('clash', { delay: 1000 });
    await this.play('explosion', { delay: 1500 });
  }
  
  // Victory fanfare
  async playVictory() {
    await this.play('victory');
  }
  
  // Defeat sound
  async playDefeat() {
    await this.play('defeat');
  }
  
  // Character reveal based on rarity
  async playCharacterReveal(rarity) {
    if (rarity === 'legendary') {
      await this.play('legendaryReveal');
    } else if (rarity === 'epic') {
      await this.play('epicReveal');
    } else {
      await this.play('characterReveal');
    }
  }
}

// Create global audio manager instance
window.audioManager = new AudioManager();
