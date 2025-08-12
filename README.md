# 🎤 Speak Notes - Voice Recording APK

A simple, standalone voice recording app that converts speech to text and saves notes offline.

## 📱 Features

- **Voice Recording** - Real-time speech-to-text conversion
- **Offline Storage** - Notes saved locally on device
- **Dark Mode** - Toggle between light and dark themes
- **Note Management** - Save, view, and delete notes
- **Mobile Optimized** - Touch-friendly interface
- **Android APK** - Ready for Android installation

## 🚀 Quick Start

### Generate APK
```bash
npm install
npm run cap:build
```

Your APK will be created at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Alternative: Open in Android Studio
```bash
npm install
npm run cap:android
```

## 📂 Project Structure

```
speak-notes/
├── dist/                          # Web app files
│   ├── index.html                 # Main app (standalone)
│   ├── manifest.json              # PWA manifest
│   └── icon.svg                   # App icon
├── android/                       # Android project
│   └── app/build/outputs/apk/     # Generated APK location
├── capacitor.config.ts            # Capacitor configuration
└── package.json                   # Dependencies and scripts
```

## 🔧 Commands

- `npm run cap:sync` - Sync web assets to Android
- `npm run cap:android` - Open project in Android Studio
- `npm run cap:build` - Build APK via command line

## 📋 Prerequisites

- **Node.js** (for npm commands)
- **Android Studio** (for APK building)
- **Java JDK 8+** (for Gradle)

## 📲 Installation

1. Build the APK using commands above
2. Copy `app-debug.apk` to your Android device
3. Enable "Unknown Sources" in Android settings
4. Install the APK
5. Grant microphone permissions when prompted

## ✨ App Features

- **Microphone Permission** - Automatic permission requests
- **Speech Recognition** - Works in Chrome, Edge, Safari
- **Local Storage** - No internet required after installation
- **Responsive Design** - Works on all screen sizes
- **Native Feel** - Behaves like a native Android app

## 🎯 Ready to Use

This project is streamlined and ready for APK generation. All unnecessary files have been removed, leaving only what's needed for building and deploying your voice recording app.

**Total project size:** Minimal (no heavy frameworks, just vanilla HTML/JS + Capacitor)

---

**Made with ❤️ for simple, effective voice note-taking**
