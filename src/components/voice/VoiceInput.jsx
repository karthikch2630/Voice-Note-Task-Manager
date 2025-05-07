import { useState } from 'react';
import { FiMic, FiMicOff, FiTrash2 } from 'react-icons/fi';
import useSpeechRecognition from '../../hooks/useSpeechRecognition';
import { motion, AnimatePresence } from 'framer-motion';
import './VoiceInput.css';

const VoiceInput = ({ onTextCapture }) => {
  const {
    text,
    setText,
    isListening,
    startListening,
    stopListening,
    resetText,
    hasRecognitionSupport,
    error
  } = useSpeechRecognition();
  
  const [visualValue, setVisualValue] = useState(50);
  
  // Animation to simulate voice levels when listening
  const animateVoiceLevel = () => {
    if (isListening) {
      const interval = setInterval(() => {
        setVisualValue(Math.floor(Math.random() * 70) + 20);
      }, 300);
      
      return () => clearInterval(interval);
    }
  };
  
  // Start or stop listening
  const toggleListening = () => {
    if (isListening) {
      stopListening();
      if (text) {
        onTextCapture(text);
      }
    } else {
      startListening();
      animateVoiceLevel();
    }
  };
  
  // Reset captured text
  const handleReset = () => {
    resetText();
    onTextCapture('');
  };
  
  if (!hasRecognitionSupport) {
    return (
      <div className="voice-input voice-input-error">
        <p>Your browser doesn't support speech recognition.</p>
      </div>
    );
  }
  
  return (
    <div className="voice-input">
      <div className="voice-controls">
        <motion.button
          whileTap={{ scale: 0.95 }}
          className={`voice-button ${isListening ? 'listening' : ''}`}
          onClick={toggleListening}
        >
          {isListening ? (
            <>
              <FiMicOff className="mic-icon" />
              <span>Stop Listening</span>
            </>
          ) : (
            <>
              <FiMic className="mic-icon" />
              <span>Start Listening</span>
            </>
          )}
        </motion.button>
        
        {text && (
          <motion.button 
            className="reset-button"
            onClick={handleReset}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
          >
            <FiTrash2 />
            <span>Clear</span>
          </motion.button>
        )}
      </div>
      
      <AnimatePresence>
        {isListening && (
          <motion.div 
            className="voice-visualizer"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="visualizer-container">
              {[...Array(20)].map((_, index) => (
                <motion.div
                  key={index}
                  className="visualizer-bar"
                  animate={{
                    height: `${Math.random() * visualValue}%`,
                    opacity: Math.random() * 0.5 + 0.5
                  }}
                  transition={{
                    duration: 0.2,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
            <p className="listening-text">Listening...</p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {text && (
        <div className="voice-text">
          <p>{text}</p>
        </div>
      )}
      
      {error && <p className="voice-error">{error}</p>}
    </div>
  );
};

export default VoiceInput;