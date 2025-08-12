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
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startRecording = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
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
      setRecording(false);
      setPaused(false);
    };
    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
    setPaused(false);
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
      <div className="recorder-controls">
        {!recording && (
          <button
            className="recorder-btn recorder-btn-main"
            onClick={startRecording}
            onTouchStart={(e) => e.preventDefault()}
            aria-label="Start recording"
          >
            <FaMicrophone />
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
    </div>
  );
};

export default Recorder;
