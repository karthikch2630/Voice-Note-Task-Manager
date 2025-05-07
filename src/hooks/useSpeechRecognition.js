import { useState, useEffect } from 'react';

const useSpeechRecognition = () => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  
  // Check if browser supports speech recognition
  const browserSupportsSpeechRecognition = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  
  // Initialize speech recognition
  let recognition = null;
  if (browserSupportsSpeechRecognition) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
  }
  
  // Start listening
  const startListening = () => {
    if (!browserSupportsSpeechRecognition) {
      setError('Your browser does not support speech recognition.');
      return;
    }
    
    setText('');
    setIsListening(true);
    recognition.start();
  };
  
  // Stop listening
  const stopListening = () => {
    if (!browserSupportsSpeechRecognition) return;
    
    setIsListening(false);
    recognition.stop();
  };
  
  // Reset text
  const resetText = () => {
    setText('');
  };
  
  useEffect(() => {
    if (!browserSupportsSpeechRecognition) return;
    
    // Event handlers
    recognition.onresult = (event) => {
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        }
      }
      
      if (finalTranscript) {
        setText((prevText) => prevText + finalTranscript);
      }
    };
    
    recognition.onerror = (event) => {
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };
    
    recognition.onend = () => {
      if (isListening) {
        // Auto restart if we're still in listening mode
        recognition.start();
      }
    };
    
    // Clean up
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [browserSupportsSpeechRecognition, isListening]);
  
  return {
    text,
    setText,
    isListening,
    startListening,
    stopListening,
    resetText,
    hasRecognitionSupport: browserSupportsSpeechRecognition,
    error
  };
};

export default useSpeechRecognition;