# Anime Death Battle - Project Architecture

## 📁 Project Structure

```
anime-death-battle/
├── server/
│   ├── index.js              # Server entry point & Socket.IO setup
│   ├── config/
│   │   ├── characters.js     # All 50 anime characters with stats
│   │   ├── rarities.js       # Rarity tiers & drop rates
│   │   └── synergies.js      # Anime synergy bonus rules
│   ├── game/
│   │   ├── Room.js           # Room management (create, join, leave)
│   │   ├── battle.js         # Battle calculation with synergies
│   │   ├── roulette.js       # Weighted character selection
│   │   ├── survival.js       # Survival mode AI & wave system
│   │   └── draft.js          # Draft mode pool & pick system
│   └── routes/
│       └── api.js            # REST API endpoints
│
├── public/
│   ├── index.html            # Main game HTML
│   ├── css/
│   │   ├── main.css          # Core styles & variables
│   │   ├── components.css    # UI component styles
│   │   ├── game.css          # Game-specific styles
│   │   └── animations.css    # All animations & effects
│   └── js/
│       ├── app.js            # Main entry point & initialization
│       ├── config.js         # Client-side constants (emojis, rarities)
│       ├── socket.js         # Socket.IO event handlers
│       ├── ui.js             # Screen management & rendering
│       ├── game.js           # Game logic (spin, battle, draft, survival)
│       └── utils.js          # Helper functions (toast, copy, etc.)
│
├── docs/
│   └── FEATURES.md           # Feature documentation
│
├── ARCHITECTURE.md           # This file
├── package.json
└── README.md
```

## 🎮 Core Features

### 1. Game Modes
Three exciting game modes to choose from:

#### Classic Mode (🎰)
- Spin for random characters
- Turn-based play against other players
- Synergy bonuses for same-anime characters

#### Survival Mode (💀)
- **Location**: `server/game/survival.js`
- Solo experience against AI
- Keep your team and face increasingly harder AI opponents
- 10 difficulty waves (Rookie → Godlike)
- AI teams scale based on player power
- Track your highest wave reached

#### Draft Mode (📋)
- **Location**: `server/game/draft.js`
- Snake draft picking system
- Take turns selecting from a shared pool
- Strategic character selection
- 3 picks per player

### 2. Multiplayer Rooms
- **Location**: `server/game/Room.js`
- 2-4 players per room
- Spectator support
- Real-time chat
- Public/private rooms

### 2. Roulette System
- **Location**: `server/game/roulette.js`, `server/config/rarities.js`
- Weighted random selection based on rarity
- 5 rarity tiers: Common → Legendary
- Visual effects for rare pulls

### 3. Synergy Bonuses
- **Location**: `server/config/synergies.js`, `server/game/battle.js`
- Bonus power for same-anime characters
- 2 chars = +5%, 3 = +12%, 4+ = +20%

### 4. Battle System
- **Location**: `server/game/battle.js`
- Compares total team power
- Includes synergy calculations
- Shareable results via URL

## 🔧 Key Configuration Files

| File | Purpose |
|------|---------|
| `server/config/characters.js` | Add/edit anime characters |
| `server/config/rarities.js` | Adjust rarity tiers & drop rates |
| `server/config/synergies.js` | Modify synergy bonus percentages |
| `public/js/config.js` | Client-side display (emojis, colors) |

## 🔌 API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/characters` | All characters with rarity info |
| `GET /api/rooms` | Active public rooms |
| `GET /api/results/:id` | Shared battle results |
| `GET /api/rarities` | Rarity tier configuration |
| `GET /api/synergies` | Synergy bonus rules |

## 🔄 Socket Events

### Client → Server
| Event | Description |
|-------|-------------|
| `createRoom` | Create new game room |
| `joinRoom` | Join existing room |
| `joinAsSpectator` | Join as spectator |
| `playerReady` | Mark player ready |
| `spin` | Spin the roulette |
| `chatMessage` | Send chat message |
| `requestRematch` | Request rematch |
| `leaveRoom` | Leave current room |
| `draftPick` | Pick character in draft mode |
| `survivalContinue` | Continue to next survival wave |

### Server → Client
| Event | Description |
|-------|-------------|
| `roomCreated` | Room creation confirmed |
| `playerJoined` | New player joined |
| `gameStart` | All players ready, game begins |
| `spinStarted` | Roulette animation trigger |
| `spinResult` | Character obtained |
| `battleStart` | Battle results ready |
| `newMessage` | Chat message received |
| `draftStart` | Draft mode begins |
| `draftPicked` | Character drafted |
| `draftNextTurn` | Next drafter's turn |
| `survivalBattleResult` | Survival wave results |

## 📝 Making Changes

### Adding a New Character
1. Edit `server/config/characters.js`
2. Add emoji to `public/js/config.js`
3. Rarity auto-assigned by power level

### Changing Rarity Rates
1. Edit `server/config/rarities.js`
2. Adjust `weight` values (higher = more common)

### Adding New Features
1. Server logic → `server/game/`
2. API routes → `server/routes/api.js`
3. Socket events → `server/index.js`
4. Client UI → `public/js/ui.js`
5. Styles → `public/css/`

## 🚀 Running the Project

```bash
npm install
npm start        # Production
npm run dev      # Development
```

Server runs on `http://localhost:3000`
