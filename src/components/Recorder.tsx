"use client";
<<<<<<< HEAD

import React, { useState, useRef, useEffect } from "react";
=======
import React, { useState, useRef } from "react";

>>>>>>> parent of d333f49 (Add typed notes, swipe-to-delete, and local storage support)
import { saveNote } from "@/lib/notes";
// import { transcribeStream } from "@/lib/deepgram";

type RecorderProps = {
  onTranscript?: (t: string) => void;
  initialTranscript?: string;
};

export default function Recorder({ onTranscript, initialTranscript = "" }: RecorderProps) {
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [transcript, setTranscript] = useState(initialTranscript);
  const [saving, setSaving] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

<<<<<<< HEAD

=======
  const handleStart = async () => {
    setTranscript("");
    setRecording(true);
    audioChunks.current = [];
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new window.MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.ondataavailable = (e) => {
      audioChunks.current.push(e.data);
    };
    mediaRecorder.onstop = async () => {
      setSaving(true);
      const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
      // TODO: Send audioBlob to Deepgram for transcription
      // For now, just fake transcript
      const fakeTranscript = "[Transcription would appear here]";
      setTranscript(fakeTranscript);
      await saveNote(fakeTranscript);
      setSaving(false);
      setRecording(false);
    };
    mediaRecorder.start();
  };

  const handleStop = () => {
    mediaRecorderRef.current?.stop();
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
>>>>>>> parent of d333f49 (Add typed notes, swipe-to-delete, and local storage support)
