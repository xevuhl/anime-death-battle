# ⚔️ Anime Death Battle

A fun multiplayer anime character battle game! Spin the roulette to collect your team of anime characters, then see who would win in an epic showdown!

![Game Preview](https://img.shields.io/badge/Game-Multiplayer-blue) ![Node.js](https://img.shields.io/badge/Node.js-18+-green) ![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-yellow)

## 🎮 How to Play

1. **Create or Join a Room** - Enter your name and create a room, or join with a room code
2. **Wait for Players** - 2-4 players can join each room
3. **Spin the Roulette** - Each player gets 3 spins to collect anime characters
4. **Battle!** - See who collected the strongest team based on total power levels
5. **Share Results** - Share your epic battle results with friends!

## 🌟 Features

- 🎰 **Roulette System** - Exciting spin animation to select characters
- 👥 **Multiplayer** - Play with 2-4 friends in real-time
- 🦸 **24 Anime Characters** - From Dragon Ball, Naruto, One Piece, Attack on Titan, and more!
- 📊 **Power Rankings** - Each character has a power level that determines battle outcomes
- 📤 **Share Results** - Generate shareable links to show off your victories
- 🌐 **Internet Play** - Easy to expose via ngrok for online play

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm (comes with Node.js)

### Installation

```bash
# Install dependencies
npm install

# Start the server
npm start
```

The game will be available at `http://localhost:3000`

### 🌐 Playing Over the Internet (ngrok)

To play with friends over the internet:

1. Install ngrok: https://ngrok.com/download
2. Run the game server: `npm start`
3. In another terminal, run: `npx ngrok http 3000`
4. Share the ngrok URL with your friends!

## 🎯 Game Rules

- Each player gets **3 spins** on the roulette
- Players take turns spinning
- The roulette randomly selects from 24 popular anime characters
- Each character has a **power level** (1,000 - 9,999)
- After all spins, total power is calculated for each player
- **Highest total power wins!**

## 📋 Character Roster

| Character | Anime | Power Level |
|-----------|-------|-------------|
| Saitama | One Punch Man | 9,999 |
| Goku | Dragon Ball | 9,500 |
| Rimuru | That Time I Got Reincarnated as a Slime | 9,400 |
| Escanor | Seven Deadly Sins | 9,300 |
| Gojo Satoru | Jujutsu Kaisen | 9,200 |
| Vegeta | Dragon Ball | 9,200 |
| Ainz Ooal Gown | Overlord | 9,100 |
| Madara Uchiha | Naruto | 9,100 |
| Mob | Mob Psycho 100 | 9,000 |
| All Might | My Hero Academia | 8,800 |
| Meliodas | Seven Deadly Sins | 8,700 |
| Naruto | Naruto | 8,500 |
| Sasuke | Naruto | 8,400 |
| Luffy | One Piece | 8,200 |
| Ichigo | Bleach | 8,000 |
| Zoro | One Piece | 8,000 |
| Yusuke Urameshi | Yu Yu Hakusho | 7,900 |
| Levi Ackerman | Attack on Titan | 7,800 |
| Killua | Hunter x Hunter | 7,700 |
| Deku | My Hero Academia | 7,600 |
| Gon | Hunter x Hunter | 7,500 |
| Eren Yeager | Attack on Titan | 7,500 |
| Tanjiro | Demon Slayer | 7,200 |
| Light Yagami | Death Note | 5,000 |

## 🛠️ Tech Stack

- **Backend**: Node.js + Express
- **Real-time**: Socket.IO
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Styling**: Custom CSS with animations

## 📁 Project Structure

```
anime-death-battle/
├── server.js           # Main server file
├── package.json        # Dependencies
├── public/
│   ├── index.html      # Game HTML
│   ├── styles.css      # Styling
│   └── game.js         # Game logic
└── README.md
```

## 🤝 Contributing

Feel free to add more characters, improve the UI, or add new features!

## 📜 License

MIT License - feel free to use this for your own projects!

---

Made with ❤️ and anime power ⚡
