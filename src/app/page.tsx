"use client";

import Recorder from "@/components/Recorder";
import NotesList from "@/components/NotesList";
import { useEffect, useState } from "react";

export default function Home() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark") {
      setDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setDark(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);
  const toggleTheme = () => {
    setDark((d) => {
      const newVal = !d;
      if (newVal) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      return newVal;
    });
  };
  return (
    <main id="main" className={"main-root" + (dark ? " dark" : "") }>
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label="Toggle dark mode"
      >
        {dark ? "☀️" : "🌙"}
      </button>
      <h1 className="main-title">Speak Notes</h1>
>
  );
}
