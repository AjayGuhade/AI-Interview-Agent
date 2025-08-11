import { useEffect, useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';

interface CheatingDetectionProps {
  onCheatingDetected: (reason: string) => void;
  disabled: boolean;
  onCameraReady?: () => void;
}

export default function CheatingDetection({ 
  onCheatingDetected, 
  disabled, 
  onCameraReady 
}: CheatingDetectionProps) {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectionInterval = useRef<NodeJS.Timeout | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [detectionActive, setDetectionActive] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Initializing...');
  const [warningLevel, setWarningLevel] = useState(0);

  // Detection thresholds and counters
  const detectionSettings = useRef({
    // Face detection
    noFaceFrames: 0,
    maxNoFaceFrames: 10, // ~3 seconds at 300ms interval
    multipleFaceFrames: 0,
    maxMultipleFaceFrames: 3,
    
    // Head position
    lookingAwayFrames: 0,
    maxLookingAwayFrames: 5,
    
    // Eye status
    eyesClosedFrames: 0,
    maxEyesClosedFrames: 8,
    
    // Warning system
    warningCount: 0,
    maxWarnings: 3,
    warningCooldown: 0
  });

  // Load models
  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models')
        ]);
        setModelsLoaded(true);
        setStatusMessage('Ready');
      } catch (err) {
        console.error("Failed to load models:", err);
        setStatusMessage('Model loading failed');
      }
    };

    loadModels();

    return () => {
      stopDetection();
    };
  }, []);

  // Start/stop detection based on props
  useEffect(() => {
    if (modelsLoaded && !disabled) {
      startDetection();
    } else {
      stopDetection();
    }
  }, [modelsLoaded, disabled]);

  const startDetection = () => {
    if (detectionInterval.current) return;
    
    setDetectionActive(true);
    detectionInterval.current = setInterval(detectFaces, 300); // 300ms interval
    setStatusMessage('Monitoring...');
  };

  const stopDetection = () => {
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current);
      detectionInterval.current = null;
    }
    setDetectionActive(false);
    setStatusMessage(disabled ? 'Disabled' : 'Ready');
  };

  const detectFaces = useCallback(async () => {
    if (!webcamRef.current?.video || !canvasRef.current || !modelsLoaded || disabled) {
      return;
    }

    try {
      const video = webcamRef.current.video;
      const canvas = canvasRef.current;
      const settings = detectionSettings.current;
      
      // Update canvas dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Detect faces with landmarks
      const detections = await faceapi.detectAllFaces(
        video, 
        new faceapi.TinyFaceDetectorOptions({ 
          inputSize: 320,
          scoreThreshold: 0.4 // Slightly higher threshold
        })
      ).withFaceLandmarks();

      // Clear canvas
      const context = canvas.getContext('2d');
      context?.clearRect(0, 0, canvas.width, canvas.height);

      // No face detected
      if (detections.length === 0) {
        settings.noFaceFrames++;
        if (settings.noFaceFrames >= settings.maxNoFaceFrames && settings.warningCooldown === 0) {
          handleWarning('Face not visible - please position yourself in frame');
        }
      } else {
        settings.noFaceFrames = 0;
      }

      // Multiple faces detected
      if (detections.length > 1) {
        settings.multipleFaceFrames++;
        if (settings.multipleFaceFrames >= settings.maxMultipleFaceFrames && settings.warningCooldown === 0) {
          handleWarning(`Multiple faces detected (${detections.length})`);
        }
      } else {
        settings.multipleFaceFrames = 0;
      }

      // Analyze each face
      if (detections.length === 1) {
        const detection = detections[0];
        const landmarks = detection.landmarks;
        
        // Draw detection (for debugging)
        if (context) {
          faceapi.draw.drawDetections(canvas, detections);
          faceapi.draw.drawFaceLandmarks(canvas, detections);
        }

        // Head pose estimation
        const jawOutline = landmarks.getJawOutline();
        const nose = landmarks.getNose();
        const leftEye = landmarks.getLeftEye();
        const rightEye = landmarks.getRightEye();
        
        // Calculate face metrics
        const jawLength = Math.hypot(
          jawOutline[0].x - jawOutline[16].x,
          jawOutline[0].y - jawOutline[16].y
        );
        
        const faceCenter = {
          x: (jawOutline[0].x + jawOutline[16].x) / 2,
          y: (jawOutline[0].y + jawOutline[16].y) / 2
        };
        
        const nosePosition = {
          x: nose[3].x,
          y: nose[3].y
        };
        
        // Looking away detection
        const deviationX = Math.abs(nosePosition.x - faceCenter.x) / jawLength;
        const deviationY = Math.abs(nosePosition.y - faceCenter.y) / jawLength;
        
        if (deviationX > 0.3 || deviationY > 0.3) {
          settings.lookingAwayFrames++;
          if (settings.lookingAwayFrames >= settings.maxLookingAwayFrames && settings.warningCooldown === 0) {
            handleWarning('Please look at the screen');
          }
        } else {
          settings.lookingAwayFrames = 0;
        }
        
        // Eye status detection
        const eyeDistance = Math.hypot(
          leftEye[0].x - rightEye[0].x,
          leftEye[0].y - rightEye[0].y
        );
        
        const leftEyeHeight = Math.abs(leftEye[1].y - leftEye[5].y);
        const rightEyeHeight = Math.abs(rightEye[1].y - rightEye[5].y);
        const eyeAspectRatio = (leftEyeHeight + rightEyeHeight) / (2 * eyeDistance);
        
        if (eyeAspectRatio < 0.25) {
          settings.eyesClosedFrames++;
          if (settings.eyesClosedFrames >= settings.maxEyesClosedFrames && settings.warningCooldown === 0) {
            handleWarning('Eyes closed for too long');
          }
        } else {
          settings.eyesClosedFrames = 0;
        }
      }

      // Handle warning cooldown
      if (settings.warningCooldown > 0) {
        settings.warningCooldown--;
      }

    } catch (err) {
      console.error("Detection error:", err);
      setStatusMessage('Detection error');
    }
  }, [disabled, modelsLoaded]);

  const handleWarning = (message: string) => {
    const settings = detectionSettings.current;
    
    settings.warningCount++;
    settings.warningCooldown = 10; // 3 second cooldown (10 frames * 300ms)
    
    setWarningLevel(settings.warningCount);
    setStatusMessage(`${message} (${settings.warningCount}/${settings.maxWarnings})`);
    
    if (settings.warningCount >= settings.maxWarnings) {
      onCheatingDetected(message);
      settings.warningCount = 0;
      setWarningLevel(0);
    }
  };

  const handleCameraReady = () => {
    if (onCameraReady) onCameraReady();
    setStatusMessage('Monitoring...');
  };

  // Warning level colors
  const getStatusColor = () => {
    if (warningLevel === 0) return 'bg-green-600';
    if (warningLevel === 1) return 'bg-yellow-600';
    if (warningLevel === 2) return 'bg-orange-600';
    return 'bg-red-600';
  };

  return (
    <div className="relative">
      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        videoConstraints={{ 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        }}
        onUserMedia={handleCameraReady}
        onUserMediaError={() => setStatusMessage('Camera error')}
        className="w-full h-auto rounded-lg border-2 border-gray-600"
      />
      
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-auto pointer-events-none"
      />
      
      {/* Status indicators */}
      <div className={`absolute top-2 left-2 ${getStatusColor()} text-white px-2 py-1 rounded text-xs`}>
        {statusMessage}
      </div>
      
      {/* Help text */}
      {!disabled && (
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
          Keep your face visible and look at the screen
        </div>
      )}
    </div>
  );
}