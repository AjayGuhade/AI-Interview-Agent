

import { useState, useEffect, useRef } from 'react';
import AIInterviewerVideo from './AIInterviewerVideo';
// import CheatingDetection from './CheatingDetection';
import * as faceapi from 'face-api.js';
import CheatingDetection from './CheatingDetection';
import AnimatedBackground from './ParticlesBackground';
import { InterviewAPI } from './services/api';

const SpeechRecognition = typeof window !== 'undefined' && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

interface ConversationItem {
  question: string;
  answer: string;
}

type InterviewPhase = 'upload' | 'question' | 'recording' | 'confirm' | 'complete';

export default function Chat() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [conversation, setConversation] = useState<ConversationItem[]>([]);
  const [phase, setPhase] = useState<InterviewPhase>('upload');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [apiError, setApiError] = useState<string | null>(null);
  const [cheatingDetected, setCheatingDetected] = useState(false);
  const [cheatingReason, setCheatingReason] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  const endRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoSubmitTimer = useRef<NodeJS.Timeout | null>(null);
  const webcamRef = useRef<any>(null);

  // Load face detection models
  useEffect(() => {
    const loadModels = async () => {
      try {
        console.log("Loading face detection models...");
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        console.log("Models loaded successfully");
        setModelsLoaded(true);
      } catch (err) {
        console.error("Failed to load face detection models:", err);
        setApiError("Failed to initialize proctoring system");
      }
    };

    loadModels();
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (e: any) => {
        let fullTranscript = '';
        for (let i = 0; i < e.results.length; i++) {
          fullTranscript += e.results[i][0].transcript + ' ';
        }
        setAnswer(fullTranscript.trim());
        setPhase('confirm');
        recognitionRef.current.stop();
        
        autoSubmitTimer.current = setTimeout(() => {
          if (phase === 'confirm') {
            handleSubmit();
          }
        }, 2000);
      };

      recognitionRef.current.onerror = (err: any) => {
        console.error("Speech recognition error:", err);
        setApiError("Voice input failed. Check your microphone access.");
        setPhase('confirm');
      };
    }

    return () => {
      if (autoSubmitTimer.current) {
        clearTimeout(autoSubmitTimer.current);
      }
    };
  }, [phase]);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(prev => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  // Tab switching detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && phase !== 'upload' && phase !== 'complete') {
        handleCheatingDetected("Tab switching detected - please stay on the interview page");
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [phase]);

  // Copy/paste detection
  useEffect(() => {
    const handleCopyPaste = (e: ClipboardEvent) => {
      if ((phase === 'recording' || phase === 'confirm') && !cheatingDetected) {
        handleCheatingDetected("Copy/paste activity detected - please answer in your own words");
        e.preventDefault();
      }
    };

    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);
    return () => {
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
    };
  }, [phase, cheatingDetected]);

  const     handleCheatingDetected = (reason: string) => {
    console.log("Cheating detected:", reason);
    setCheatingDetected(true);
    setCheatingReason(reason);
    recognitionRef.current?.stop();
    setPhase('complete');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const startVoiceRecording = () => {
    setAnswer('');
    setPhase('recording');
    try {
      recognitionRef.current?.start();
    } catch (err) {
      console.error("Speech recognition failed:", err);
      setApiError("Could not start voice input. Try again.");
      setPhase('question');
    }
  };
  

  const handleResumeUpload = async (file: File) => {
    if (!file) return;
  
    setResumeUploading(true);
    setApiError(null);
  
    try {
      const uploadData = await InterviewAPI.uploadResume(file);
      setSessionId(uploadData.sessionId);
  
      const chatData = await InterviewAPI.sendChatAnswer(
        uploadData.sessionId,
        "",
        30,
        0
      );
  
      setCurrentQuestion(chatData.nextQuestion);
      setPhase('question');
      setConversation([{ question: chatData.nextQuestion, answer: '' }]);
  
      toggleFullscreen();
    } catch (error) {
      console.error("Upload error:", error);
      setApiError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setResumeUploading(false);
    }
  };
  
  const handleSubmit = async () => {
    if (autoSubmitTimer.current) clearTimeout(autoSubmitTimer.current);
    if (!answer.trim()) {
      setApiError("Please provide an answer before submitting");
      return;
    }
  
    setLoading(true);
    setApiError(null);
  
    try {
      const data = await InterviewAPI.sendChatAnswer(
        sessionId!,
        answer,
        30,
        Math.floor((30 * 60 - timeLeft) / 60)
      );
  
      const updatedConversation = [...conversation, {
        question: currentQuestion,
        answer
      }];
      setConversation(updatedConversation);
  
      if (data.nextQuestion) {
        setCurrentQuestion(data.nextQuestion);
        setAnswer('');
        setPhase('question');
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
  
        setTimeout(() => {
          setConversation(prev => [...prev, { question: data.nextQuestion, answer: '' }]);
        }, 500);
      } else {
        setPhase('complete');
      }
  
    } catch (error) {
      console.error("Error:", error);
      setApiError(`Failed to proceed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setPhase('confirm');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    // <div className="min-h-screen flex flex-col md:flex-row bg-gray-950 text-white">
      <div className='min-h-screen flex flex-col md:flex-row text-white'>            <AnimatedBackground />
      {/* </div> */}
      {cheatingDetected ? (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-red-900 text-white p-8 text-center">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold mb-6">⚠️ Cheating Detected</h1>
            <p className="text-xl mb-4">{cheatingReason}</p>
            <p className="text-lg mb-8">The interview has been terminated due to suspicious activity.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-white text-red-900 hover:bg-gray-200 px-8 py-3 rounded-lg font-medium text-lg"
            >
              Start New Interview
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Left Panel - Video/Upload */}
          <div className="flex-1 flex flex-col items-center p-6">
            <div className="w-full flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold text-blue-500">AI Interview</h1>
              <div className="flex items-center gap-4">
                <div className="bg-gray-800 px-4 py-2 rounded-lg text-yellow-400">
                  ⏱️ {formatTime(timeLeft)}
                </div>
              </div>
            </div>

            {phase === 'upload' && (
              <div className="flex flex-col items-center justify-center h-full">
                <h2 className="text-2xl font-bold mb-6">Upload Your Resume to Begin</h2>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => e.target.files?.[0] && handleResumeUpload(e.target.files[0])}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={resumeUploading}
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-lg font-medium disabled:opacity-50"
                >
                  {resumeUploading ? 'Uploading...' : 'Select Resume'}
                </button>
                {apiError && (
                  <div className="mt-4 p-3 bg-red-900 text-red-100 rounded-lg">
                    {apiError}
                  </div>
                )}
              </div>
            )}
  
            {phase !== 'upload' && (
              <>
                <button 
                  onClick={toggleFullscreen}
                  className="mb-4 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg"
                >
                  {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                </button>
                <AIInterviewerVideo
                  text={phase === 'question' ? currentQuestion : ''}
                  onFeedbackComplete={() => {
                    if (phase === 'question') {
                      startVoiceRecording();
                    }
                  }}
                />
              </>
            )}
          </div>
  
          {/* Right Panel - Conversation History */}
          {phase !== 'upload' && (
            <div className="md:w-1/3 w-full flex flex-col border-l border-gray-700 h-screen">
              <div className="p-4 bg-gray-800 border-b border-gray-700">
                <CheatingDetection 
                  onCheatingDetected={handleCheatingDetected} 
                  disabled={cheatingDetected || phase === 'complete'}
                  onCameraReady={() => setCameraReady(true)}
                />
              </div>
  
              <div className="p-4 bg-gray-900 overflow-y-auto flex-1">
                <h2 className="text-xl font-semibold text-center mb-4 text-blue-400">
                  Interview Progress
                </h2>
                
                {conversation.map((item, i) => (
                  <div key={i} className="mb-6">
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <p className="text-blue-300 font-semibold">Q: {item.question}</p>
                      {item.answer && (
                        <p className="text-green-300 mt-2">Your Answer: {item.answer}</p>
                      )}
                    </div>
                    <hr className="border-gray-700 my-3" />
                  </div>
                ))}
                <div ref={endRef} />
              </div>
  
              <div className="p-4 bg-gray-800 border-t border-gray-700">
                {apiError && (
                  <div className="mb-4 p-3 bg-red-900 text-red-100 rounded-lg">
                    {apiError}
                  </div>
                )}
  
                {phase === 'question' && (
                  <div className="flex flex-col gap-4">
                    <button
                      onClick={startVoiceRecording}
                      disabled={!cameraReady}
                      className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg text-lg disabled:opacity-50"
                    >
                      🎤 Start Answering
                    </button>
                    <button
                      onClick={() => setPhase('confirm')}
                      className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg text-lg"
                    >
                      ✏️ Type Answer Instead
                    </button>
                  </div>
                )}
  
                {phase === 'recording' && (
                  <div className="text-center py-8 animate-pulse text-yellow-300">
                    🎙️ Listening... Speak now.
                    <button
                      onClick={() => {
                        recognitionRef.current?.stop();
                        setPhase('confirm');
                      }}
                      className="mt-4 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
                    >
                      Stop Recording
                    </button>
                  </div>
                )}
  
                {phase === 'confirm' && (
                  <div className="flex flex-col gap-4">
                    <textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      className="w-full p-4 h-32 rounded-lg border border-gray-600 bg-gray-700 text-white"
                      placeholder="Type or edit your answer here..."
                    />
                    <div className="flex gap-4">
                      <button
                        onClick={() => {
                          setPhase('question');
                          setAnswer('');
                        }}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={loading || !answer.trim()}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg disabled:opacity-50"
                      >
                        {loading ? 'Sending...' : 'Submit Answer'}
                      </button>
                    </div>
                  </div>
                )}
  
                {phase === 'complete' && (
                  <div className="bg-green-900 bg-opacity-20 p-6 rounded-lg text-center border border-green-700">
                    <h2 className="text-2xl font-bold text-green-400 mb-4">
                      🎉 Interview Completed!
                    </h2>
                    <p className="text-white mb-6">
                      You answered {conversation.filter(c => c.answer).length} questions in {formatTime(30 * 60 - timeLeft)}.
                    </p>
                    <button
                      onClick={() => window.location.reload()}
                      className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium"
                    >
                      Start New Interview
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 
