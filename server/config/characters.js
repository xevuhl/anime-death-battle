// Anime Characters Database
// Power levels determine rarity automatically (see rarities.js)

const characters = [
  // Dragon Ball (6 characters)
  { id: 1, name: "Goku", anime: "Dragon Ball", power: 9500, color: "#FF6B00" },
  { id: 2, name: "Vegeta", anime: "Dragon Ball", power: 9200, color: "#0000CD" },
  { id: 3, name: "Gohan", anime: "Dragon Ball", power: 8900, color: "#9400D3" },
  { id: 4, name: "Frieza", anime: "Dragon Ball", power: 9100, color: "#800080" },
  { id: 5, name: "Broly", anime: "Dragon Ball", power: 9600, color: "#228B22" },
  { id: 6, name: "Beerus", anime: "Dragon Ball", power: 9800, color: "#4B0082" },
  
  // One Punch Man (3 characters)
  { id: 7, name: "Saitama", anime: "One Punch Man", power: 9999, color: "#FFD700" },
  { id: 8, name: "Garou", anime: "One Punch Man", power: 9000, color: "#DC143C" },
  { id: 9, name: "Boros", anime: "One Punch Man", power: 8800, color: "#00CED1" },
  
  // Naruto (7 characters)
  { id: 10, name: "Naruto", anime: "Naruto", power: 8500, color: "#FF7F00" },
  { id: 11, name: "Sasuke", anime: "Naruto", power: 8400, color: "#4B0082" },
  { id: 12, name: "Madara Uchiha", anime: "Naruto", power: 9100, color: "#8B0000" },
  { id: 13, name: "Itachi Uchiha", anime: "Naruto", power: 8600, color: "#B22222" },
  { id: 14, name: "Kakashi", anime: "Naruto", power: 7800, color: "#708090" },
  { id: 15, name: "Minato", anime: "Naruto", power: 8300, color: "#FFD700" },
  { id: 16, name: "Pain", anime: "Naruto", power: 8700, color: "#FF4500" },
  
  // One Piece (6 characters)
  { id: 17, name: "Luffy", anime: "One Piece", power: 8200, color: "#FF0000" },
  { id: 18, name: "Zoro", anime: "One Piece", power: 8000, color: "#006400" },
  { id: 19, name: "Sanji", anime: "One Piece", power: 7700, color: "#FFD700" },
  { id: 20, name: "Kaido", anime: "One Piece", power: 9300, color: "#4169E1" },
  { id: 21, name: "Shanks", anime: "One Piece", power: 9000, color: "#DC143C" },
  { id: 22, name: "Whitebeard", anime: "One Piece", power: 9200, color: "#FFFFFF" },
  
  // Bleach (3 characters)
  { id: 23, name: "Ichigo", anime: "Bleach", power: 8000, color: "#FF4500" },
  { id: 24, name: "Aizen", anime: "Bleach", power: 9100, color: "#8B4513" },
  { id: 25, name: "Yamamoto", anime: "Bleach", power: 9000, color: "#FF6347" },
  
  // Attack on Titan (3 characters)
  { id: 26, name: "Eren Yeager", anime: "Attack on Titan", power: 7500, color: "#228B22" },
  { id: 27, name: "Levi Ackerman", anime: "Attack on Titan", power: 7800, color: "#2F4F4F" },
  { id: 28, name: "Mikasa", anime: "Attack on Titan", power: 7400, color: "#B22222" },
  
  // Jujutsu Kaisen (3 characters)
  { id: 29, name: "Gojo Satoru", anime: "Jujutsu Kaisen", power: 9200, color: "#4169E1" },
  { id: 30, name: "Sukuna", anime: "Jujutsu Kaisen", power: 9400, color: "#8B0000" },
  { id: 31, name: "Yuta Okkotsu", anime: "Jujutsu Kaisen", power: 8500, color: "#000080" },
  
  // Demon Slayer (3 characters)
  { id: 32, name: "Tanjiro", anime: "Demon Slayer", power: 7200, color: "#DC143C" },
  { id: 33, name: "Muzan", anime: "Demon Slayer", power: 8800, color: "#8B0000" },
  { id: 34, name: "Yoriichi", anime: "Demon Slayer", power: 9500, color: "#FF6347" },
  
  // My Hero Academia (3 characters)
  { id: 35, name: "All Might", anime: "My Hero Academia", power: 8800, color: "#FFD700" },
  { id: 36, name: "Deku", anime: "My Hero Academia", power: 7600, color: "#32CD32" },
  { id: 37, name: "All For One", anime: "My Hero Academia", power: 8700, color: "#2F4F4F" },
  
  // Seven Deadly Sins (2 characters)
  { id: 38, name: "Meliodas", anime: "Seven Deadly Sins", power: 8700, color: "#FFD700" },
  { id: 39, name: "Escanor", anime: "Seven Deadly Sins", power: 9300, color: "#FFA500" },
  
  // Mob Psycho 100 (1 character)
  { id: 40, name: "Mob", anime: "Mob Psycho 100", power: 9000, color: "#9932CC" },
  
  // Isekai (3 characters)
  { id: 41, name: "Rimuru", anime: "Tensura", power: 9400, color: "#00CED1" },
  { id: 42, name: "Ainz Ooal Gown", anime: "Overlord", power: 9100, color: "#4B0082" },
  { id: 43, name: "Anos Voldigoad", anime: "Misfit of Demon King", power: 9700, color: "#8B0000" },
  
  // Hunter x Hunter (4 characters)
  { id: 44, name: "Gon", anime: "Hunter x Hunter", power: 7500, color: "#32CD32" },
  { id: 45, name: "Killua", anime: "Hunter x Hunter", power: 7700, color: "#E0FFFF" },
  { id: 46, name: "Meruem", anime: "Hunter x Hunter", power: 9200, color: "#228B22" },
  { id: 47, name: "Netero", anime: "Hunter x Hunter", power: 8600, color: "#DAA520" },
  
  // Others (3 characters)
  { id: 48, name: "Light Yagami", anime: "Death Note", power: 5000, color: "#8B4513" },
  { id: 49, name: "Yusuke Urameshi", anime: "Yu Yu Hakusho", power: 7900, color: "#228B22" },
  { id: 50, name: "Saber", anime: "Fate/Stay Night", power: 8100, color: "#4169E1" }
];

module.exports = characters;
