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
  const detectionInterval = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [multipleFaceCount, setMultipleFaceCount] = useState(0);
  const [noFaceCount, setNoFaceCount] = useState(0);
  const [cheatingWarnings, setCheatingWarnings] = useState(0);
  const [warningMessage, setWarningMessage] = useState('');
  const [detectionActive, setDetectionActive] = useState(false);
  const [lookingAwayCount, setLookingAwayCount] = useState(0);
  const [eyesClosedCount, setEyesClosedCount] = useState(0);
  const [showFaceHiddenPopup, setShowFaceHiddenPopup] = useState(false);

  // Load models and initialize
  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models')
        ]);
        setModelsLoaded(true);
      } catch (err) {
        console.error("Failed to load face detection models:", err);
      }
    };

    loadModels();

    return () => {
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
      }
    };
  }, []);

  // Face detection and cheating check logic
  const detectFaces = useCallback(async () => {
    if (!webcamRef.current?.video || !canvasRef.current || disabled || !modelsLoaded) {
      return;
    }

    try {
      const video = webcamRef.current.video;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Detect faces with landmarks and expressions
      const detections = await faceapi.detectAllFaces(
        video, 
        new faceapi.TinyFaceDetectorOptions({ 
          scoreThreshold: 0.3, // More sensitive
          inputSize: 512 // Higher resolution for better detection
        })
      ).withFaceLandmarks().withFaceExpressions();

      // Clear previous drawings
      const context = canvas.getContext('2d');
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, detections);
        faceapi.draw.drawFaceLandmarks(canvas, detections);
        faceapi.draw.drawFaceExpressions(canvas, detections);
      }

      // Multiple faces detection (requires 2 consecutive detections)
      if (detections.length > 1) {
        setMultipleFaceCount(prev => prev + 1);
        if (multipleFaceCount >= 1) {
          handleCheatingWarning(`Multiple faces detected (${detections.length} people)`);
          setMultipleFaceCount(0);
        }
      } else {
        setMultipleFaceCount(0);
      }

      // No face detection (show popup immediately)
      if (detections.length === 0) {
        setNoFaceCount(prev => prev + 1);
        setShowFaceHiddenPopup(true);
        
        if (noFaceCount >= 2) { // After 5 seconds, consider it cheating
          handleCheatingWarning("No face detected - please position yourself in frame");
          setNoFaceCount(0);
          setShowFaceHiddenPopup(false);
        }
      } else {
        setNoFaceCount(0);
        setShowFaceHiddenPopup(false);
        
        // Only check head pose and eye status if we have exactly one face
        if (detections.length === 1) {
          const detection = detections[0];
          const landmarks = detection.landmarks;
          
          if (landmarks) {
            // Get positions of relevant landmarks for head pose estimation
            const jawOutline = landmarks.getJawOutline();
            const nose = landmarks.getNose();
            const leftEye = landmarks.getLeftEye();
            const rightEye = landmarks.getRightEye();
            
            // Simple head pose estimation
            const jawLength = Math.sqrt(
              Math.pow(jawOutline[0].x - jawOutline[16].x, 2) + 
              Math.pow(jawOutline[0].y - jawOutline[16].y, 2));
            
            const eyeDistance = Math.sqrt(
              Math.pow(leftEye[0].x - rightEye[0].x, 2) + 
              Math.pow(leftEye[0].y - rightEye[0].y, 2));
            
            const nosePosition = {
              x: nose[3].x,
              y: nose[3].y
            };
            
            const faceCenter = {
              x: (jawOutline[0].x + jawOutline[16].x) / 2,
              y: (jawOutline[0].y + jawOutline[16].y) / 2
            };
            
            // Calculate deviation from center
            const deviationX = Math.abs(nosePosition.x - faceCenter.x) / jawLength;
            const deviationY = Math.abs(nosePosition.y - faceCenter.y) / jawLength;
            
            // Looking away detection (requires 2 consecutive detections)
            if (deviationX > 0.25 || deviationY > 0.25) { // More sensitive
              setLookingAwayCount(prev => prev + 1);
              if (lookingAwayCount >= 1) {
                handleCheatingWarning('Looking away from screen');
                setLookingAwayCount(0);
              }
            } else {
              setLookingAwayCount(0);
            }
            
            // Check if eyes are closed
            const leftEyeHeight = Math.abs(leftEye[1].y - leftEye[5].y);
            const rightEyeHeight = Math.abs(rightEye[1].y - rightEye[5].y);
            const eyeAspectRatio = (leftEyeHeight + rightEyeHeight) / (2 * eyeDistance);
            
            // Eyes closed detection (requires 3 consecutive detections)
            if (eyeAspectRatio < 0.2) { // More sensitive
              setEyesClosedCount(prev => prev + 1);
              if (eyesClosedCount >= 2) {
                handleCheatingWarning('Eyes closed for too long');
                setEyesClosedCount(0);
              }
            } else {
              setEyesClosedCount(0);
            }
          }
        }
      }

    } catch (err) {
      console.error("Face detection error:", err);
    }
  }, [
    disabled, 
    modelsLoaded, 
    multipleFaceCount, 
    noFaceCount,
    lookingAwayCount,
    eyesClosedCount
  ]);

  const handleCheatingWarning = (reason: string) => {
    const newWarnings = cheatingWarnings + 1;
    setCheatingWarnings(newWarnings);
    setWarningMessage(`${reason} (Warning ${newWarnings}/3)`);
    
    if (newWarnings >= 3) {
      onCheatingDetected(`${reason} - Interview terminated after 3 warnings`);
      setCheatingWarnings(0);
      setWarningMessage('');
      setDetectionActive(false);
    }
  };

  // Set up detection interval when models are loaded and not disabled
  useEffect(() => {
    if (!modelsLoaded || disabled) {
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
        detectionInterval.current = null;
        setDetectionActive(false);
      }
      return;
    }

    if (!detectionInterval.current) {
      detectionInterval.current = setInterval(detectFaces, 500); // Faster detection
      setDetectionActive(true);
    }

    return () => {
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
        detectionInterval.current = null;
        setDetectionActive(false);
      }
    };
  }, [modelsLoaded, disabled, detectFaces]);

  const handleCameraReady = () => {
    if (onCameraReady) onCameraReady();
    setDetectionActive(true);
  };

  return (
    <div className="relative">
      {/* Face Hidden Popup */}
      {showFaceHiddenPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-red-600 text-white p-6 rounded-lg max-w-md text-center animate-pulse">
            <h3 className="text-2xl font-bold mb-4">⚠️ Face Not Visible</h3>
            <p className="mb-4">Please position your face in the camera view</p>
            <button 
              onClick={() => setShowFaceHiddenPopup(false)}
              className="bg-white text-red-600 px-4 py-2 rounded font-medium"
            >
              I Understand
            </button>
          </div>
        </div>
      )}

      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        videoConstraints={{ 
          facingMode: 'user',
          width: 1280,
          height: 720,
          frameRate: 30
        }}
        onUserMedia={handleCameraReady}
        onUserMediaError={(err) => console.error("Webcam error:", err)}
        className="w-full h-auto rounded-lg border-2 border-gray-600"
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-auto pointer-events-none"
      />
      
      {/* Status indicators */}
      <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs">
        AI Proctoring {detectionActive ? "Active ✅" : modelsLoaded ? "Ready" : "Loading ⏳"}
      </div>
      
      <div className="absolute top-10 left-2 bg-gray-800 text-white px-2 py-1 rounded text-xs">
        {warningMessage ? (
          <span className="text-yellow-300">{warningMessage}</span>
        ) : (
          <>
            {multipleFaceCount > 0 && `Multiple faces detected (${multipleFaceCount}/2)`}
            {/* {noFaceCount > 0 && `No face detected (${noFaceCount}/5)`} */}
            {lookingAwayCount > 0 && `Looking away (${lookingAwayCount}/2)`}
            {eyesClosedCount > 0 && `Eyes closed (${eyesClosedCount}/3)`}
            {!multipleFaceCount && !noFaceCount && !lookingAwayCount && !eyesClosedCount && detectionActive && "Monitoring..."}
          </>
        )}
      </div>
      
      {/* Help text */}
      {!disabled && (
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
          Please keep your face visible during the interview
        </div>
      )}
    </div>
  );
}