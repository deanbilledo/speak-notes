"use client";
import React, { useRef, useState } from "react";
import { FaMicrophone, FaPause, FaStop } from "react-icons/fa";

interface SpeechRecognitionEvent {
  results: {
    [key: number]: {
      [key: number]: {
        transcript: string;
      };
      isFinal: boolean;
    };
    length: number;
  };
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: (event: any) => void;
  onstart: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

const Recorder: React.FC = () => {
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [requesting, setRequesting] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Check if we're on localhost
  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  
  // Check browser compatibility and microphone access
  const checkCompatibility = () => {
    console.log('Checking browser compatibility...');
    console.log('Has webkitSpeechRecognition:', 'webkitSpeechRecognition' in window);
    console.log('Has SpeechRecognition:', 'SpeechRecognition' in window);
    console.log('Has getUserMedia:', !!navigator.mediaDevices?.getUserMedia);
    console.log('User agent:', navigator.userAgent);
  };

  // Test microphone access directly
  const testMicrophone = async () => {
    console.log('=== MICROPHONE TEST START ===');
    console.log('Browser:', navigator.userAgent);
    console.log('Protocol:', window.location.protocol);
    console.log('Host:', window.location.host);
    console.log('Full URL:', window.location.href);
    console.log('Is secure context:', window.isSecureContext);
    
    // Check if we're on localhost or HTTPS
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isHTTPS = window.location.protocol === 'https:';
    
    console.log('Is localhost:', isLocalhost);
    console.log('Is HTTPS:', isHTTPS);
    
    if (!isLocalhost && !isHTTPS) {
      alert('⚠️ SECURITY ISSUE: Microphone access requires HTTPS or localhost.\n\nCurrent URL: ' + window.location.href + '\n\nPlease use: http://localhost:3000\n\nNOT the network IP address.');
      return;
    }
    
    // Check if navigator exists
    if (!navigator) {
      console.error('Navigator not available');
      alert('Navigator not available in this browser.');
      return;
    }
    
    // Check if mediaDevices exists
    if (!navigator.mediaDevices) {
      console.error('navigator.mediaDevices not available');
      alert('Media devices not supported. Please use a modern browser and ensure you\'re on localhost or HTTPS.');
      return;
    }
    
    // Check if getUserMedia exists
    if (!navigator.mediaDevices.getUserMedia) {
      console.error('getUserMedia not supported');
      alert('getUserMedia not supported. Please use a modern browser and ensure you\'re on localhost or HTTPS.');
      return;
    }
    
    console.log('All checks passed - getUserMedia is available');
    
    try {
      console.log('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('SUCCESS: Microphone access granted!');
      console.log('Stream:', stream);
      console.log('Audio tracks:', stream.getAudioTracks());
      
      // Stop the stream
      stream.getTracks().forEach(track => {
        console.log('Stopping track:', track);
        track.stop();
      });
      
      alert('SUCCESS! Microphone access works. Now try the voice recording.');
      
    } catch (error) {
      console.error('FAILED: Microphone access error:', error);
      
      if (error instanceof DOMException) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        
        if (error.name === 'NotAllowedError') {
          alert('Microphone access was DENIED. Please:\n1. Refresh the page\n2. Click the microphone icon in your browser\'s address bar\n3. Select "Allow" for microphone access');
        } else if (error.name === 'NotFoundError') {
          alert('No microphone found. Please check your microphone connection.');
        } else {
          alert('Microphone error: ' + error.message);
        }
      } else {
        alert('Unknown microphone error occurred.');
      }
    }
    
    console.log('=== MICROPHONE TEST END ===');
  };

  const startRecording = async () => {
    checkCompatibility();
    
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    setRequesting(true);

    // First, test microphone access
    try {
      console.log('Requesting microphone permission...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Microphone permission granted!');
      // Stop the stream immediately as we only needed it for permission
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Microphone permission error:', error);
      setRequesting(false);
      
      if (error instanceof DOMException) {
        switch (error.name) {
          case 'NotAllowedError':
            alert('Microphone access denied. Please click "Allow" when prompted and try again.');
            break;
          case 'NotFoundError':
            alert('No microphone found. Please connect a microphone and try again.');
            break;
          case 'NotSupportedError':
            alert('Microphone access not supported in this browser.');
            break;
          default:
            alert('Error accessing microphone: ' + error.message);
        }
      } else {
        alert('Error accessing microphone. Please try again.');
      }
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = "";
        let final = "";
        for (let i = 0; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        setTranscript(final + interim);
      };
      
      recognition.onend = () => {
        console.log('Speech recognition ended');
        setRecording(false);
        setPaused(false);
        setRequesting(false);
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setRecording(false);
        setPaused(false);
        setRequesting(false);
        
        switch (event.error) {
          case 'not-allowed':
            alert('Speech recognition access denied. Please allow microphone access and try again.');
            break;
          case 'no-speech':
            console.log('No speech detected, but continuing...');
            // Don't show alert for no-speech as it's common
            break;
          case 'audio-capture':
            alert('Microphone not found. Please check your microphone connection and try again.');
            break;
          case 'network':
            alert('Network error occurred. Please check your internet connection and try again.');
            break;
          case 'service-not-allowed':
            alert('Speech recognition service not allowed. Please try again.');
            break;
          default:
            console.error('Unknown speech recognition error:', event.error);
            alert('Speech recognition error occurred. Please try again.');
        }
      };
      
      recognition.onstart = () => {
        console.log('Speech recognition started successfully');
        setRecording(true);
        setPaused(false);
        setRequesting(false);
      };

      recognitionRef.current = recognition;
      
      // Start speech recognition - permission already granted
      console.log('Starting speech recognition...');
      recognition.start();
      
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setRequesting(false);
      setRecording(false);
      setPaused(false);
      
      alert('Error starting speech recognition. Please try again.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setRecording(false);
    setPaused(false);
    if (transcript.trim()) {
      const stored = localStorage.getItem("notes");
      const notes = stored ? JSON.parse(stored) : [];
      const note = {
        id: Date.now().toString(),
        content: transcript,
        created: Date.now(),
      };
      const updated = [note, ...notes];
      localStorage.setItem("notes", JSON.stringify(updated));
      window.dispatchEvent(new Event("notes-updated"));
      setTranscript("");
    }
  };

  const pauseRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setPaused(true);
    }
  };

  const resumeRecording = () => {
    if (!paused) return;
    startRecording();
  };

  return (
    <div className="recorder-root">
      {!isLocalhost && (
        <div style={{
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '8px',
          padding: '12px',
          margin: '10px 0',
          color: '#856404'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
            🎤 Microphone Access Limited
          </div>
          <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
            For microphone access, please use:{' '}
            <a 
              href={`http://localhost:${window.location.port || '3001'}`}
              style={{ color: '#007bff', textDecoration: 'underline' }}
            >
              http://localhost:{window.location.port || '3001'}
            </a>
            <br />
            <small>Network IPs require HTTPS for microphone access</small>
          </div>
        </div>
      )}
      
      <div className="recorder-controls">
        <button
          onClick={testMicrophone}
          style={{ 
            padding: '10px 20px', 
            margin: '10px', 
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🧪 Test Microphone Access
        </button>
        
        {!recording && !requesting && (
          <button
            className="recorder-btn recorder-btn-main"
            onClick={startRecording}
            onTouchStart={(e) => e.preventDefault()}
            aria-label="Start recording"
          >
            <FaMicrophone />
          </button>
        )}
        {requesting && (
          <button
            className="recorder-btn recorder-btn-requesting"
            disabled
            aria-label="Requesting microphone access"
          >
            <FaMicrophone />
            <span className="requesting-text">Requesting mic access...</span>
          </button>
        )}
        {recording && !paused && (
          <>
            <button
              className="recorder-btn recorder-btn-stop"
              onClick={stopRecording}
              onTouchStart={(e) => e.preventDefault()}
              aria-label="Stop recording"
            >
              <FaStop />
            </button>
            <button
              className="recorder-btn recorder-btn-pause"
              onClick={pauseRecording}
              onTouchStart={(e) => e.preventDefault()}
              aria-label="Pause recording"
            >
              <FaPause />
            </button>
          </>
        )}
        {recording && paused && (
          <button
            className="recorder-btn recorder-btn-main"
            onClick={resumeRecording}
            onTouchStart={(e) => e.preventDefault()}
            aria-label="Resume recording"
          >
            <FaMicrophone />
          </button>
        )}
      </div>
      {transcript && (
        <div className="transcript-preview">
          <p>{transcript}</p>
        </div>
      )}
    </div>
  );
};

export default Recorder;
