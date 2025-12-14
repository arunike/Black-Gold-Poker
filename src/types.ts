export const GameState = {
	INITIALIZING: 'INITIALIZING',
	STACKED: 'STACKED', // Fist: Cards in a single pile
	SHUFFLING: 'SHUFFLING', // Open Hand: Cards scattering/flowing
	FAN: 'FAN', // Victory (2 fingers): Classic Fan
	SPIRAL: 'SPIRAL', // Three (3 fingers): Deep Vortex
	FOCUSED: 'FOCUSED', // One Finger: Card selected, others bg
	REVEALED: 'REVEALED', // Shaking finger: Card flips
};

export type GameState = (typeof GameState)[keyof typeof GameState];

export const GestureType = {
	UNKNOWN: 'UNKNOWN',
	FIST: 'FIST', // 0 fingers
	POINTING: 'POINTING', // 1 finger (Index)
	VICTORY: 'VICTORY', // 2 fingers (Index + Middle)
	THREE: 'THREE', // 3 fingers
	OPEN_PALM: 'OPEN_PALM', // 4-5 fingers
};

export type GestureType = (typeof GestureType)[keyof typeof GestureType];

export type CardData = {
	id: number;
	name: string;
	suit: string;
	suitName: string;
	rank: string;
	color: string;
};

export type HandPosition = {
	x: number;
	y: number;
	gesture: GestureType;
	isShaking: boolean;
	detected: boolean;
};

export type CardReading = {
	cardName: string;
	interpretation: string;
};
