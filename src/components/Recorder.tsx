"use client";
import React, { useState, useRef } from "react";
import { FaMicrophone, FaStop } from "react-icons/fa";

const Recorder: React.FC = () => {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  const startRecording = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event: any) => {
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
    };
    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setRecording(false);
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

  return (
    <div className="recorder-root">
      <div className="recorder-controls">
        {!recording && (
          <button
            className="recorder-btn recorder-btn-main"
            onClick={startRecording}
            aria-label="Start recording"
          >
            <FaMicrophone />
          </button>
        )}
        {recording && (
          <button
            className="recorder-btn recorder-btn-stop"
            onClick={stopRecording}
            aria-label="Stop recording"
          >
            <FaStop />
          </button>
        )}
      </div>
    </div>
  );
};

export default Recorder;
