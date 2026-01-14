// Battle Animation System for Anime Death Battle
// Creates epic animated showdowns between winning characters

class BattleAnimator {
  constructor() {
    this.animationDuration = 4000; // 4 seconds for full battle animation
  }
  
  // Main entry point for battle animations
  async animateShowdown(battleData, container) {
    // Create the showdown arena
    const showdownHtml = this.createShowdownArena(battleData);
    container.innerHTML = showdownHtml;
    
    // Get elements for animation
    const arena = container.querySelector('.showdown-arena');
    const leftFighter = container.querySelector('.fighter-left');
    const rightFighter = container.querySelector('.fighter-right');
    const vsElement = container.querySelector('.vs-clash');
    const effectsContainer = container.querySelector('.battle-effects');
    
    // Play battle sound
    if (window.audioManager) {
      window.audioManager.playBattleSequence();
    }
    
    // Run the animation sequence
    await this.runAnimationSequence(leftFighter, rightFighter, vsElement, effectsContainer, battleData);
    
    return true;
  }
  
  createShowdownArena(battleData) {
    const winner = battleData.winner;
    const players = battleData.players;
    
    // Get top character from winner and runner-up for the showdown
    const winnerChar = players[0]?.characters?.[0];
    const runnerUpChar = players[1]?.characters?.[0];
    
    if (!winnerChar || !runnerUpChar) {
      return this.createSimpleArena(battleData);
    }
    
    const winnerEmoji = window.characterEmojis?.[winnerChar.name] || '⭐';
    const runnerUpEmoji = window.characterEmojis?.[runnerUpChar.name] || '⭐';
    
    const winnerRarity = winnerChar.rarity?.key || 'common';
    const runnerUpRarity = runnerUpChar.rarity?.key || 'common';
    
    return `
      <div class="showdown-arena">
        <div class="battle-sky">
          <div class="lightning-bolt left"></div>
          <div class="lightning-bolt right"></div>
          <div class="energy-waves"></div>
        </div>
        
        <div class="fighters-container">
          <!-- Left Fighter (Winner) -->
          <div class="fighter fighter-left winner ${winnerRarity}" style="--fighter-color: ${winnerChar.color}">
            <div class="fighter-aura"></div>
            <div class="fighter-glow"></div>
            <div class="fighter-image">
              <span class="fighter-emoji">${winnerEmoji}</span>
            </div>
            <div class="fighter-name">${winnerChar.name}</div>
            <div class="fighter-power">⚡ ${winnerChar.power.toLocaleString()}</div>
            <div class="winner-crown">👑</div>
          </div>
          
          <!-- VS Clash Effect -->
          <div class="vs-clash">
            <div class="clash-ring ring-1"></div>
            <div class="clash-ring ring-2"></div>
            <div class="clash-ring ring-3"></div>
            <span class="vs-text">VS</span>
            <div class="clash-sparks"></div>
          </div>
          
          <!-- Right Fighter (Runner-up) -->
          <div class="fighter fighter-right ${runnerUpRarity}" style="--fighter-color: ${runnerUpChar.color}">
            <div class="fighter-aura"></div>
            <div class="fighter-glow"></div>
            <div class="fighter-image">
              <span class="fighter-emoji">${runnerUpEmoji}</span>
            </div>
            <div class="fighter-name">${runnerUpChar.name}</div>
            <div class="fighter-power">⚡ ${runnerUpChar.power.toLocaleString()}</div>
          </div>
        </div>
        
        <!-- Battle Effects Layer -->
        <div class="battle-effects">
          <div class="impact-wave"></div>
          <div class="power-clash"></div>
          <div class="particle-explosion"></div>
        </div>
        
        <!-- Player Info -->
        <div class="showdown-players">
          <div class="showdown-player winner-player">
            <span class="player-label">🏆 WINNER</span>
            <span class="player-name-label">${players[0].name}</span>
            <span class="total-power">Total: ⚡${players[0].totalPower.toLocaleString()}</span>
          </div>
          <div class="showdown-player runner-player">
            <span class="player-label">🥈 2nd Place</span>
            <span class="player-name-label">${players[1].name}</span>
            <span class="total-power">Total: ⚡${players[1].totalPower.toLocaleString()}</span>
          </div>
        </div>
      </div>
    `;
  }
  
  createSimpleArena(battleData) {
    return `
      <div class="showdown-arena simple">
        <div class="winner-spotlight">
          <h2>🏆 BATTLE COMPLETE! 🏆</h2>
        </div>
      </div>
    `;
  }
  
  async runAnimationSequence(leftFighter, rightFighter, vsElement, effectsContainer, battleData) {
    // Phase 1: Fighters enter (0-1s)
    await this.animateFightersEnter(leftFighter, rightFighter);
    
    // Phase 2: VS clash appears (1-1.5s)
    await this.animateVSClash(vsElement);
    
    // Phase 3: Power buildup (1.5-2.5s)
    await this.animatePowerBuildup(leftFighter, rightFighter);
    
    // Phase 4: Impact/Clash (2.5-3s)
    await this.animateImpact(effectsContainer);
    
    // Phase 5: Winner revealed (3-4s)
    await this.animateWinnerReveal(leftFighter);
  }
  
  animateFightersEnter(left, right) {
    return new Promise(resolve => {
      if (left) {
        left.classList.add('entering');
      }
      if (right) {
        right.classList.add('entering');
      }
      setTimeout(() => {
        if (left) left.classList.remove('entering');
        if (right) right.classList.remove('entering');
        if (left) left.classList.add('ready');
        if (right) right.classList.add('ready');
        resolve();
      }, 800);
    });
  }
  
  animateVSClash(vsElement) {
    return new Promise(resolve => {
      if (vsElement) {
        vsElement.classList.add('active');
      }
      setTimeout(resolve, 500);
    });
  }
  
  animatePowerBuildup(left, right) {
    return new Promise(resolve => {
      if (left) left.classList.add('powering-up');
      if (right) right.classList.add('powering-up');
      setTimeout(resolve, 1000);
    });
  }
  
  animateImpact(effectsContainer) {
    return new Promise(resolve => {
      if (effectsContainer) {
        effectsContainer.classList.add('impact');
      }
      setTimeout(resolve, 500);
    });
  }
  
  animateWinnerReveal(winnerFighter) {
    return new Promise(resolve => {
      if (winnerFighter) {
        winnerFighter.classList.add('victorious');
      }
      setTimeout(resolve, 1000);
    });
  }
}

// Create global battle animator instance
window.battleAnimator = new BattleAnimator();

// Helper function to trigger showdown animation
window.playBattleShowdown = async function(battleData, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return false;
  
  // Add loading state
  container.classList.add('animating');
  
  try {
    await window.battleAnimator.animateShowdown(battleData, container);
    return true;
  } catch (e) {
    console.error('Battle animation failed:', e);
    return false;
  } finally {
    container.classList.remove('animating');
  }
};
