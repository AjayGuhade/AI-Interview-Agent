import { useState, useRef, useEffect } from 'react';

export default function AIInterviewerVideo({
  text,
  feedback,
  onFeedbackComplete,
}: {
  text: string;
  feedback?: string;
  onFeedbackComplete?: () => void;
}) {
  const [mode, setMode] = useState<'idle' | 'speaking' | 'feedback'>('idle');
  const [subtitle, setSubtitle] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  const videoSources = {
    idle: '/idle3.mov',
    speaking: '/speaking3.mp4',
    feedback: '/feedback.mp4',
  };

  // Extract just the question from formatted text
  const extractQuestion = (content: string) => {
    if (!content) return '';
    
    // Try to find the "Interview Question:" marker
    const questionMarker = content.indexOf('Interview Question:');
    if (questionMarker > -1) {
      return content.substring(questionMarker + 'Interview Question:'.length).trim();
    }
    
    // Try to find the first quoted question
    const quotedMatch = content.match(/"([^"]+)"/);
    if (quotedMatch) {
      return quotedMatch[1];
    }
    
    // Fallback to first line that ends with ?
    const lines = content.split('\n');
    const questionLine = lines.find(line => line.trim().endsWith('?'));
    return questionLine ? questionLine.trim() : content;
  };

  const speak = (content: string, isFeedback = false) => {
    if (!content) return;

    // Extract just the question if this is the initial prompt
    const speechContent = isFeedback ? content : extractQuestion(content);
    setSubtitle(speechContent);

    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.name.includes('Google UK English Female')) || 
                  voices.find(v => v.lang.includes('en-US'));

    const utterance = new SpeechSynthesisUtterance(speechContent);
    utterance.voice = voice || null;
    utterance.rate = 0.95;
    utterance.pitch = 0.9;
    utterance.volume = 1;

    utterance.onstart = () => {
      setMode(isFeedback ? 'feedback' : 'speaking');
    };

    utterance.onend = () => {
      if (isFeedback) {
        setTimeout(() => {
          setMode('idle');
          setSubtitle('');
          onFeedbackComplete?.();
        }, 2000);
      } else {
        setMode('idle');
        setSubtitle('');
      }
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    // Initialize voices
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    };
    loadVoices();
  }, []);

  useEffect(() => {
    if (text) {
      speak(text);
    }
  }, [text]);

  useEffect(() => {
    if (feedback) {
      speak(feedback, true);
    }
  }, [feedback]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.src = videoSources[mode];
      video.loop = mode !== 'speaking';
      video.play().catch(console.error);
    }
  }, [mode]);

  return (
    <div className="w-full aspect-[16/10] rounded-xl overflow-hidden border-4 border-blue-100 shadow-lg relative">
      <video 
        ref={videoRef} 
        autoPlay 
        muted 
        className="w-full h-full object-cover" 
      />
      
      {subtitle && (
        <div className="absolute bottom-10 left-0 right-0 flex justify-center">
          <div className="bg-black bg-opacity-70 px-6 py-3 rounded-lg max-w-[90%]">
            <p className="text-white text-xl text-center font-medium">
              {subtitle}
            </p>
          </div>
        </div>
      )}
      
      {mode === 'speaking' && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-50 rounded-full p-2">
          <div className="flex space-x-1">
            {[0, 150, 300].map(delay => (
              <div 
                key={delay}
                className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}