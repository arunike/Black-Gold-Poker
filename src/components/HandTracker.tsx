import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { GameState, GestureType } from '../types';
import type { HandPosition } from '../types';
import { SHAKE_THRESHOLD, SHAKE_HISTORY_LENGTH, COLORS } from '../constants';

interface HandTrackerProps {
  onUpdate: (pos: HandPosition) => void;
  gameState: GameState;
  setGameState: (state: GameState) => void;
}

const HandTracker: React.FC<HandTrackerProps> = ({ onUpdate, gameState }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [debugInfo, setDebugInfo] = useState({ fingers: 0, gesture: '' });
  const lastVideoTime = useRef(-1);
  const requestRef = useRef<number>(0);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  
  // History for shake detection (x positions of index tip)
  const movementHistory = useRef<number[]>([]);

  // Initialize MediaPipe
  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
        );
        if (!active) return;
        
        landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });
        setLoaded(true);
        startWebcam();
      } catch (e) {
        console.error("Failed to load MediaPipe:", e);
      }
    };
    init();

    return () => {
      active = false;
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
              width: 640, 
              height: 480,
              facingMode: "user" 
          } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Explicitly play and start loop
        videoRef.current.onloadedmetadata = () => {
             videoRef.current?.play();
             predictWebcam();
        };
      }
    } catch (err) {
      console.error("Webcam access denied", err);
      // Fallback for "no camera" dev mode - keeps app alive
      onUpdate({ x: 0, y: 0, gesture: GestureType.UNKNOWN, isShaking: false, detected: false });
    }
  };

  const drawLandmarks = (landmarks: NormalizedLandmark[]) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2;
    ctx.strokeStyle = COLORS.GOLD;
    ctx.fillStyle = COLORS.GOLD_EMISSIVE;

    // Helper to draw lines
    const drawLine = (start: number, end: number) => {
      ctx.beginPath();
      ctx.moveTo(landmarks[start].x * canvas.width, landmarks[start].y * canvas.height);
      ctx.lineTo(landmarks[end].x * canvas.width, landmarks[end].y * canvas.height);
      ctx.stroke();
    };

    // Fingers connections
    drawLine(0, 1); drawLine(1, 2); drawLine(2, 3); drawLine(3, 4);
    drawLine(0, 5); drawLine(5, 6); drawLine(6, 7); drawLine(7, 8);
    drawLine(9, 10); drawLine(10, 11); drawLine(11, 12); drawLine(0, 9);
    drawLine(13, 14); drawLine(14, 15); drawLine(15, 16); drawLine(0, 13);
    drawLine(0, 17); drawLine(17, 18); drawLine(18, 19); drawLine(19, 20);
    drawLine(5, 9); drawLine(9, 13); drawLine(13, 17);

    // Draw points
    landmarks.forEach((lm) => {
      ctx.beginPath();
      ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 3, 0, 2 * Math.PI);
      ctx.fill();
    });
  };

  const detectGesture = (landmarks: NormalizedLandmark[]): GestureType => {
    // Landmark Indices:
    // Thumb: 1-4
    // Index: 5-8
    // Middle: 9-12
    // Ring: 13-16
    // Pinky: 17-20

    // Check extension: Tip Y < PIP Y (assuming upright hand)
    // Note: Y increases downwards.
    
    const indexUp = landmarks[8].y < landmarks[6].y;
    const middleUp = landmarks[12].y < landmarks[10].y;
    const ringUp = landmarks[16].y < landmarks[14].y;
    const pinkyUp = landmarks[20].y < landmarks[18].y;

    // Count main fingers (excluding thumb for simpler classification)
    const fingerCount = (indexUp ? 1 : 0) + (middleUp ? 1 : 0) + (ringUp ? 1 : 0) + (pinkyUp ? 1 : 0);
    
    // Debug logging
    let detectedGesture = GestureType.UNKNOWN;
    
    // Relaxed classification
    if (fingerCount === 0) {
        detectedGesture = GestureType.FIST;
    } else if (fingerCount === 1) {
        if (indexUp) detectedGesture = GestureType.POINTING;
        // Ignore single middle/ring/pinky as they are rare/rude
    } else if (fingerCount === 2) {
        if (indexUp && middleUp) detectedGesture = GestureType.VICTORY;
    } else if (fingerCount === 3) {
        // Any 3 fingers can trigger vortex - more forgiving
        detectedGesture = GestureType.THREE;
    } else if (fingerCount >= 4) {
        detectedGesture = GestureType.OPEN_PALM;
    }
    
    // Update debug info
    setDebugInfo({ fingers: fingerCount, gesture: detectedGesture });

    return detectedGesture;
  };

  const detectShake = (x: number): boolean => {
    movementHistory.current.push(x);
    if (movementHistory.current.length > SHAKE_HISTORY_LENGTH) {
      movementHistory.current.shift();
    }
    if (movementHistory.current.length < SHAKE_HISTORY_LENGTH) return false;

    const mean = movementHistory.current.reduce((a, b) => a + b, 0) / SHAKE_HISTORY_LENGTH;
    const variance = movementHistory.current.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / SHAKE_HISTORY_LENGTH;
    
    return variance > (SHAKE_THRESHOLD * 0.05); // Tweaked sensitivity
  };

  const predictWebcam = () => {
    // Safety check if component unmounted
    if (!videoRef.current) return;

    // Check if video is ready
    if (videoRef.current.readyState < 2) {
         requestRef.current = requestAnimationFrame(predictWebcam);
         return;
    }

    let startTimeMs = performance.now();
    
    if (videoRef.current.currentTime !== lastVideoTime.current && landmarkerRef.current) {
      lastVideoTime.current = videoRef.current.currentTime;
      const detections = landmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);

      if (detections.landmarks && detections.landmarks.length > 0) {
        const landmarks = detections.landmarks[0];
        
        drawLandmarks(landmarks);
        const gesture = detectGesture(landmarks);
        
        const indexTip = landmarks[8];
        const x = (indexTip.x - 0.5) * 2 * -1; 
        const y = (indexTip.y - 0.5) * 2 * -1;

        const isShaking = detectShake(indexTip.x);

        onUpdate({ x, y, gesture, isShaking, detected: true });

      } else {
         const canvas = canvasRef.current;
         const ctx = canvas?.getContext('2d');
         ctx?.clearRect(0, 0, canvas?.width || 0, canvas?.height || 0);
         onUpdate({ x: 0, y: 0, gesture: GestureType.UNKNOWN, isShaking: false, detected: false });
      }
    }

    requestRef.current = requestAnimationFrame(predictWebcam);
  };

  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none flex flex-col items-end hidden">
      <div className="relative rounded-lg overflow-hidden w-48 h-36 bg-black/50 backdrop-blur-sm border border-gold/30 shadow-[0_0_20px_rgba(201,165,92,0.2)]">
        <video 
          ref={videoRef} 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover opacity-80"
          style={{ transform: 'scaleX(-1)' }} 
        />
        <canvas
            ref={canvasRef}
            width={640}
            height={480}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }}
        />
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-gold">
            Initializing Vision...
          </div>
        )}
      </div>
      {/* Debug Info */}
      <div className="mt-2 bg-black/80 border border-gold/40 rounded px-3 py-2 text-xs text-gold font-mono">
        <div>Fingers: {debugInfo.fingers}</div>
        <div>Gesture: {debugInfo.gesture}</div>
      </div>
    </div>
  );
};

export default HandTracker;
    