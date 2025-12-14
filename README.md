# Black Gold Poker

An immersive 3D tarot card experience controlled by hand gestures through your webcam. Experience mystical card readings with intuitive gesture controls and stunning visual effects.

Built with:

- TypeScript with React, Three.js, and MediaPipe featuring real-time hand tracking, 3D graphics, and gesture-based interactions.

## 🌟 Features

- **Hand Gesture Controls** - Control cards with natural hand movements detected by your webcam
- **Real-time Hand Tracking** - Powered by MediaPipe for accurate gesture recognition
- **Immersive 3D Graphics** - Beautiful card animations using React Three Fiber and Three.js
- **Multiple Card Formations** - Switch between Stack, Fan, and Spiral arrangements with gestures
- **Interactive Card Draw** - Point to select and shake to reveal your card
- **Dynamic Visual Effects** - Particle systems, bloom effects, and cinematic lighting
- **Gesture Recognition System** - Detects fist, pointing, victory, three-finger, and open palm gestures
- **Smooth Animations** - Fluid card movements and state transitions
- **Mystical Theme** - Black and gold aesthetic with ethereal atmosphere
- **Responsive Design** - Optimized 3D performance for various devices

## 🎮 Gesture Controls

- **✊ Fist** - Stack all cards together
- **☝️ Point (1 finger)** - Draw/select a card
- **✌️ Victory (2 fingers)** - Arrange cards in Fan formation
- **🤟 Three Fingers** - Trigger Vortex/Spiral effect
- **✋ Open Palm** - Shuffle and scatter cards
- **🤝 Shake** - Flip and reveal the selected card

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm package manager
- Webcam for gesture controls

### Installation

1. **Clone the repository**

    ```bash
    git clone https://github.com/yourusername/black-gold-poker
    cd black-gold-poker
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Start the development server**

    ```bash
    npm run dev
    ```

4. **Open your browser**

    Navigate to `http://localhost:5173` (or the port shown in your terminal)
    
5. **Allow webcam access**

    Click "Click to Start" and grant webcam permissions when prompted

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint for code quality

## 🛠️ Tech Stack

### Core
- **React 19** - UI library
- **TypeScript 5.8** - Type-safe JavaScript
- **Vite 5** - Build tool and dev server

### 3D Graphics
- **Three.js 0.182** - 3D graphics library
- **@react-three/fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers for React Three Fiber
- **@react-three/postprocessing** - Post-processing effects (Bloom, Vignette, etc.)

### Computer Vision
- **@mediapipe/tasks-vision** - Hand tracking and gesture recognition

### Styling
- **Tailwind CSS** - Utility-first CSS framework
- **Custom Shaders** - GLSL shaders for special effects

## 📁 Project Structure

```
src/
├── components/         # React components
│   ├── Card.tsx       # Individual 3D card component
│   ├── TarotDeck.tsx  # Deck manager with physics
│   ├── Experience.tsx # 3D scene setup
│   ├── HandTracker.tsx # MediaPipe hand tracking
│   └── UIOverlay.tsx  # 2D UI layer
├── types.ts           # TypeScript type definitions
├── constants.ts       # Game constants and configuration
├── App.tsx            # Main app component
├── main.tsx          # Application entry point
└── assets/           # Static assets
```

## 🎯 Game States

- **INITIALIZING** - Welcome screen with start button
- **STACKED** - Cards neatly stacked together
- **SHUFFLING** - Cards floating in a cloud formation
- **FAN** - Classic semicircle fan arrangement
- **SPIRAL** - Mystical vortex formation
- **FOCUSED** - Single card selected and brought forward
- **REVEALED** - Selected card flipped to show reading

## 🎨 Customization

### Visual Theme

Edit `src/constants.ts` to customize colors:

```typescript
export const COLORS = {
  VOID: '#050505',
  GOLD: '#C9A55C',
  GOLD_EMISSIVE: '#d4af6a',
  MYSTIC_PURPLE: '#2a1b3d'
};
```

### Card Configuration

Adjust card deck size and layout in `src/constants.ts`:

```typescript
export const DECK_SIZE = 52;
export const SPREAD_RADIUS = 15;
export const CARD_WIDTH = 2.5;
export const CARD_HEIGHT = 3.5;
```

## 📦 Building for Production

```bash
npm run build
```

The optimized production build will be in the `dist/` directory. Deploy to any static hosting service.

## 📄 License

This project is open source and available under the MIT License.

## 👤 Author

**Richie Zhou**

- GitHub: [@arunike](https://github.com/)

## 🙏 Acknowledgments

- Hand tracking powered by [MediaPipe](https://mediapipe.dev/)
- 3D graphics using [Three.js](https://threejs.org/) and [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- Visual effects with [Postprocessing](https://github.com/pmndrs/postprocessing)
- Inspired by mystical tarot aesthetics
