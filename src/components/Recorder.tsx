"use client";

import React, { useState, useRef, useEffect } from "react";
import { saveNote } from "@/lib/notes";

type RecorderProps = {
  onTranscript?: (t: string) => void;
  initialTranscript?: string;
};

export default function Recorder({ onTranscript, initialTranscript = "" }: RecorderProps) {
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [transcript, setTranscript] = useState(initialTranscript);
  const [saving, setSaving] = useState(false);
  const recognitionRef = useRef<any>(null);


