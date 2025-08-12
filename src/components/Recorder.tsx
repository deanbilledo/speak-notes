"use client";

import React, { useState, useRef } from "react";
import { saveNote } from "@/lib/notes";

export default function Recorder() {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [saving, setSaving] = useState(false);
  const recognitionRef = useRef<any>(null);

  const handleStart = async () => {
    if (typeof window === "undefined") return;
    // On mobile, request mic permission explicitly
    if (window.navigator && window.navigator.mediaDevices && window.navigator.mediaDevices.getUserMedia) {
      try {
        await window.navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err) {
        setTranscript("Microphone permission denied.");
        return;
      }
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setTranscript("Speech recognition not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    let finalTranscript = "";
    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setTranscript(finalTranscript + interim);
    };
    recognition.onerror = (event: any) => {
      setTranscript("Microphone access denied or error: " + event.error);
      setRecording(false);
    };
    recognition.onend = async () => {
      setSaving(true);
      if (finalTranscript.trim()) {
        await saveNote(finalTranscript.trim());
      }
      setSaving(false);
      setRecording(false);
    };
    setTranscript("");
    setRecording(true);
    recognition.start();
  };

  const handleStop = () => {
    recognitionRef.current?.stop();
  };

  return (
    <div className="w-full flex flex-col items-center">
      <button
        className={`bg-blue-500 text-white rounded-full w-20 h-20 flex items-center justify-center text-3xl shadow-lg mb-4 transition-all duration-200 ${recording ? "bg-red-500 animate-pulse" : ""}`}
        onClick={recording ? handleStop : handleStart}
        disabled={saving}
        aria-label={recording ? "Stop recording" : "Start recording"}
      >
        {recording ? "■" : "🎤"}
      </button>
      <div className="text-center min-h-[2rem] text-lg font-mono">
        {transcript || (recording ? "Listening..." : "Press to start recording")}
      </div>
      {saving && <div className="text-blue-400 mt-2">Saving note...</div>}
    </div>
  );
}
