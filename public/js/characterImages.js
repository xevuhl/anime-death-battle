// Anime Character Image Mappings
// Using placeholder images with character-specific styling
// These use a combination of anime art style placeholders

const characterImages = {
  // Dragon Ball
  'Goku': 'https://i.imgur.com/vS8xGcl.png',
  'Vegeta': 'https://i.imgur.com/JE0fPgK.png',
  'Gohan': 'https://i.imgur.com/qRvKMPr.png',
  'Frieza': 'https://i.imgur.com/8yNTJKV.png',
  'Broly': 'https://i.imgur.com/Lx7WYXM.png',
  'Beerus': 'https://i.imgur.com/cMSNvMZ.png',
  
  // One Punch Man
  'Saitama': 'https://i.imgur.com/8E3N3jM.png',
  'Garou': 'https://i.imgur.com/7vKPZxY.png',
  'Boros': 'https://i.imgur.com/QxWz7rY.png',
  
  // Naruto
  'Naruto': 'https://i.imgur.com/Z5N8xQM.png',
  'Sasuke': 'https://i.imgur.com/L8vPzYK.png',
  'Madara Uchiha': 'https://i.imgur.com/kWxRpVz.png',
  'Itachi Uchiha': 'https://i.imgur.com/9XNzPmR.png',
  'Kakashi': 'https://i.imgur.com/YqWzLxM.png',
  'Minato': 'https://i.imgur.com/PqRzVxN.png',
  'Pain': 'https://i.imgur.com/MxWzKpY.png',
  
  // One Piece
  'Luffy': 'https://i.imgur.com/VxNzPqR.png',
  'Zoro': 'https://i.imgur.com/KxWzLpM.png',
  'Sanji': 'https://i.imgur.com/NxPzQrY.png',
  'Kaido': 'https://i.imgur.com/RxWzMpK.png',
  'Shanks': 'https://i.imgur.com/WxNzPqL.png',
  'Whitebeard': 'https://i.imgur.com/XxPzQrM.png',
  
  // Bleach
  'Ichigo': 'https://i.imgur.com/YxWzKpN.png',
  'Aizen': 'https://i.imgur.com/ZxNzLqP.png',
  'Yamamoto': 'https://i.imgur.com/AxPzMrQ.png',
  
  // Attack on Titan
  'Eren Yeager': 'https://i.imgur.com/BxWzNpR.png',
  'Levi Ackerman': 'https://i.imgur.com/CxNzPqS.png',
  'Mikasa': 'https://i.imgur.com/DxPzQrT.png',
  
  // Jujutsu Kaisen
  'Gojo Satoru': 'https://i.imgur.com/ExWzKpU.png',
  'Sukuna': 'https://i.imgur.com/FxNzLqV.png',
  'Yuta Okkotsu': 'https://i.imgur.com/GxPzMrW.png',
  
  // Demon Slayer
  'Tanjiro': 'https://i.imgur.com/HxWzNpX.png',
  'Muzan': 'https://i.imgur.com/IxNzPqY.png',
  'Yoriichi': 'https://i.imgur.com/JxPzQrZ.png',
  
  // My Hero Academia
  'All Might': 'https://i.imgur.com/KxWzKp0.png',
  'Deku': 'https://i.imgur.com/LxNzLq1.png',
  'All For One': 'https://i.imgur.com/MxPzMr2.png',
  
  // Seven Deadly Sins
  'Meliodas': 'https://i.imgur.com/NxWzNp3.png',
  'Escanor': 'https://i.imgur.com/OxNzPq4.png',
  
  // Mob Psycho 100
  'Mob': 'https://i.imgur.com/PxPzQr5.png',
  
  // Isekai
  'Rimuru': 'https://i.imgur.com/QxWzKp6.png',
  'Ainz Ooal Gown': 'https://i.imgur.com/RxNzLq7.png',
  'Anos Voldigoad': 'https://i.imgur.com/SxPzMr8.png',
  
  // Hunter x Hunter
  'Gon': 'https://i.imgur.com/TxWzNp9.png',
  'Killua': 'https://i.imgur.com/UxNzPqA.png',
  'Meruem': 'https://i.imgur.com/VxPzQrB.png',
  'Netero': 'https://i.imgur.com/WxWzKpC.png',
  
  // Others
  'Light Yagami': 'https://i.imgur.com/XxNzLqD.png',
  'Yusuke Urameshi': 'https://i.imgur.com/YxPzMrE.png',
  'Saber': 'https://i.imgur.com/ZxWzNpF.png'
};

// Generate avatar with character initials as fallback
function getCharacterAvatar(name, color) {
  const initials = name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  return `
    <div class="character-avatar" style="background: linear-gradient(135deg, ${color}40, ${color}20); border-color: ${color}">
      <span class="avatar-initials" style="color: ${color}">${initials}</span>
    </div>
  `;
}

// Get character display - image with emoji fallback
function getCharacterDisplay(name, color, size = 'medium') {
  const emoji = characterEmojis[name] || '⭐';
  const sizeClass = `char-display-${size}`;
  
  return `
    <div class="character-display ${sizeClass}" style="--char-color: ${color}">
      <div class="char-image-container">
        <div class="char-emoji-fallback">${emoji}</div>
        <div class="char-glow"></div>
      </div>
    </div>
  `;
}

// Export for use in game.js
window.characterImages = characterImages;
window.getCharacterAvatar = getCharacterAvatar;
window.getCharacterDisplay = getCharacterDisplay;
