# 🎵 Mulingo

**Learn music like Duolingo teaches language.**

Mulingo is an interactive web application that makes learning music fun, engaging, and accessible. Just like Duolingo breaks down language learning into bite-sized lessons, Mulingo teaches music theory and piano playing through progressive, gamified exercises with instant feedback.

## Features

- **Interactive 88-Key Piano**: Full-featured virtual piano spanning A0 to C8
- **Real-time Sound Generation**: Uses Web Audio API for authentic piano sounds
- **Progressive Lessons**: Structured lessons that build from basics to melodies
- **Duolingo-Style Learning**: Bite-sized exercises with instant feedback and progress tracking
- **Visual Sheet Music**: See notes on a staff as you play
- **Visual Feedback**: Highlights keys, shows note names, and provides exercise feedback
- **Multiple Input Methods**: Click keys with mouse or use computer keyboard
- **Modern UI**: Beautiful, responsive design that works on desktop and mobile

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, or Edge)
- No installation required - it's a pure web app!

### Running the App

1. **Simple Method**: Just open `index.html` in your web browser
   - Double-click the `index.html` file, or
   - Right-click and select "Open with" your preferred browser

2. **Using a Local Server** (Recommended for best experience):
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Python 2
   python -m SimpleHTTPServer 8000
   
   # Using Node.js (if you have http-server installed)
   npx http-server
   ```
   Then open `http://localhost:8000` in your browser

## How to Use

### Basic Navigation

1. **Select a Lesson**: Click on any lesson in the sidebar to start
2. **Start Lesson**: Click the "Start Lesson" button to begin exercises
3. **Play Keys**: 
   - Click keys with your mouse, or
   - Use your computer keyboard (A, S, D, F, G, H, J, K, L for white keys)
4. **Follow Instructions**: Read the instructions and complete the exercises
5. **Progress**: Watch your progress bar fill as you complete lessons

### Keyboard Shortcuts

- **White Keys**: A, S, D, F, G, H, J, K, L, ;, '
- **Black Keys**: W, E, T, Y, U, O, P

### Lesson Structure

1. **Introduction to Piano Keys** - Explore the keyboard layout
2. **Learning C, D, E** - Master the first three white keys
3. **Learning F, G, A, B** - Complete the white keys
4. **C Major Scale** - Play your first scale
5. **Simple Melody: Twinkle Twinkle** - Play your first song
6. **Chords: C Major** - Play your first chord
7. **Simple Melody: Happy Birthday** - Play a familiar tune
8. **Black Keys Introduction** - Learn about sharps and flats
9. **Playing Sharps** - Practice sharp notes (#)
10. **Playing Flats** - Practice flat notes (♭)
11. **Treble Clef: Spaces then Lines** - Memorize treble clef notes (FACE, EGBDF)
12. **Bass Clef: Spaces then Lines** - Memorize bass clef notes (ACEG, GBDF(A))

## Features Explained

### Piano Keyboard
- **White Keys**: Natural notes (C, D, E, F, G, A, B)
- **Black Keys**: Sharps/flats (C#, D#, F#, G#, A#)
- **Visual Feedback**: Keys highlight when pressed
- **Note Labels**: Toggle to show/hide note names on keys

### Lesson System
- **Progressive Learning**: Lessons build on previous knowledge
- **Exercise Types**:
  - **Sequence**: Play notes in order
  - **Chord**: Play multiple notes together
  - **Melody**: Play a complete song
- **Real-time Feedback**: Get instant feedback on your playing

### Visual Feedback
- **Key Highlighting**: Keys light up when pressed
- **Note Display**: See the current note name and symbol
- **Progress Tracking**: Visual progress bar shows your advancement
- **Exercise Completion**: Badges show which notes you've played correctly

## File Structure

```
mulingo/
├── index.html      # Main HTML structure
├── styles.css     # Styling and layout
├── piano.js       # Piano keyboard and sound generation
├── lessons.js     # Lesson system and exercises
├── sheetmusic.js  # Sheet music display
├── app.js         # Main application controller
└── README.md      # This file
```

## Browser Compatibility

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

**Note**: Web Audio API support is required for sound generation. Most modern browsers support this.

## Tips for Beginners

1. **Start Slow**: Take your time with each lesson
2. **Practice Regularly**: Consistent practice is key to learning
3. **Use Both Methods**: Try both mouse clicks and keyboard shortcuts
4. **Listen Carefully**: Pay attention to the sounds each key makes
5. **Follow the Sequence**: Complete lessons in order for best results
6. **Don't Rush**: Accuracy is more important than speed

## Future Enhancements

Potential features for future versions:
- More lessons and exercises
- Sheet music display
- Recording and playback
- Metronome
- Multiple instrument sounds
- Progress saving
- Advanced exercises

## Technical Details

- **Pure JavaScript**: No frameworks required
- **Web Audio API**: For sound generation
- **CSS Grid & Flexbox**: For responsive layout
- **Modern ES6+**: Uses classes and modern JavaScript features

## License

This project is open source and available for educational purposes.

## Contributing

Feel free to fork this project and add your own features! Some ideas:
- Additional lessons
- More songs
- Different instrument sounds
- Advanced exercises
- Multi-language support

## Vision

Mulingo aims to make music education as accessible and engaging as language learning. Just as Duolingo has made learning languages fun and approachable for millions, Mulingo brings the same gamified, progressive learning approach to music theory and piano playing.

**Start your musical journey today! 🎵**



