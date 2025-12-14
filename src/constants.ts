export const COLORS = {
	VOID: '#020204',
	GOLD: '#C9A55C',
	GOLD_EMISSIVE: '#ffaa00',
	MYSTIC_PURPLE: '#1a1025',
	PARTICLE: '#ebd69c',
};

export const SUITS = [
	{ name: 'Spades', symbol: '♠' },
	{ name: 'Hearts', symbol: '♥' },
	{ name: 'Clubs', symbol: '♣' },
	{ name: 'Diamonds', symbol: '♦' },
];

export const RANKS = ['A', 'K', 'Q', 'J', '10', '9', '8', '7'];

// MediaPipe config
export const SHAKE_THRESHOLD = 0.02; // Threshold for finger movement variance
export const SHAKE_HISTORY_LENGTH = 10;

// 3D Scene Config
export const DECK_SIZE = 52; // Full deck for the "cloud" effect
export const CARD_WIDTH = 2;
export const CARD_HEIGHT = 2.8;
export const SPREAD_RADIUS = 12; // How far cards scatter
