// API Routes
const express = require('express');
const router = express.Router();

const { getCharactersWithRarity, characters } = require('../game/roulette');
const { rarityTiers } = require('../config/rarities');
const { synergyBonuses } = require('../config/synergies');

// Store for battle results (passed from main server)
let battleResults = null;
let rooms = null;

function initRoutes(battleResultsStore, roomsStore) {
  battleResults = battleResultsStore;
  rooms = roomsStore;
  return router;
}

// Get all characters with rarity info
router.get('/characters', (req, res) => {
  res.json(getCharactersWithRarity());
});

// Get rarity tier configuration
router.get('/rarities', (req, res) => {
  res.json(rarityTiers);
});

// Get synergy bonus configuration
router.get('/synergies', (req, res) => {
  res.json(synergyBonuses);
});

// Get active public rooms
router.get('/rooms', (req, res) => {
  const activeRooms = [];
  rooms.forEach((room, code) => {
    if (room.phase === 'lobby' && room.isPublic) {
      activeRooms.push({
        code: code,
        hostName: room.players[0]?.name || 'Unknown',
        playerCount: room.players.length,
        maxPlayers: room.maxPlayers,
        spectatorCount: room.spectators.length
      });
    }
  });
  res.json(activeRooms);
});

// Get shared battle results
router.get('/results/:id', (req, res) => {
  const result = battleResults.get(req.params.id);
  if (result) {
    res.json(result);
  } else {
    res.status(404).json({ error: 'Results not found' });
  }
});

module.exports = initRoutes;
