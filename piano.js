// Piano Keyboard and Sound Generation

class Piano {
    constructor() {
        this.audioContext = null;
        this.keys = [];
        this.pressedKeys = new Set();
        this.showNoteNames = true;
        this.highlightKeys = true;
        this.highlightTimeouts = new Map(); // Track highlight timeouts
        this.initAudioContext();
        this.createKeyboard();
        this.setupEventListeners();
    }

    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.error('AudioContext not supported:', error);
        }
    }

    createKeyboard() {
        const keyboard = document.getElementById('piano-keyboard');
        keyboard.innerHTML = '';

        // Piano keys: C4 to C6 (2 octaves - original layout)
        const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        const blackKeys = ['C#', 'D#', '', 'F#', 'G#', 'A#', ''];
        
        // Create white keys first
        for (let octave = 4; octave < 6; octave++) {
            for (let i = 0; i < whiteKeys.length; i++) {
                const note = whiteKeys[i];
                const fullNote = `${note}${octave}`;
                const key = this.createWhiteKey(fullNote, note, octave, i);
                keyboard.appendChild(key);
                this.keys.push({ element: key, note: fullNote, frequency: this.getFrequency(fullNote) });
            }
        }

        // Add black keys on top
        // Black keys follow 2-3 pattern: C#, D# (group of 2), then F#, G#, A# (group of 3)
        for (let octave = 4; octave < 6; octave++) {
            let blackKeyPosition = 0; // Track actual black key position (0-4)
            for (let i = 0; i < blackKeys.length; i++) {
                if (blackKeys[i]) {
                    const note = blackKeys[i];
                    const fullNote = `${note}${octave}`;
                    const key = this.createBlackKey(fullNote, note, octave, blackKeyPosition);
                    keyboard.appendChild(key);
                    this.keys.push({ element: key, note: fullNote, frequency: this.getFrequency(fullNote) });
                    blackKeyPosition++;
                }
            }
        }
    }

    createWhiteKey(fullNote, note, octave, position) {
        const key = document.createElement('div');
        key.className = 'piano-key white-key';
        key.dataset.note = fullNote;
        key.dataset.frequency = this.getFrequency(fullNote);
        
        if (this.showNoteNames) {
            const label = document.createElement('div');
            label.className = 'key-label';
            label.textContent = note;
            key.appendChild(label);
        }
        
        return key;
    }

    createBlackKey(fullNote, note, octave, position) {
        const key = document.createElement('div');
        key.className = 'piano-key black-key';
        key.dataset.note = fullNote;
        key.dataset.frequency = this.getFrequency(fullNote);
        
        // Position black keys BETWEEN white keys (not on top)
        // C# between C and D, D# between D and E, F# between F and G, G# between G and A, A# between A and B
        // Position mapping: 0->C#, 1->D#, 2->F#, 3->G#, 4->A#
        let whiteKeyIndex;
        
        if (position === 0) whiteKeyIndex = 0; // C# between C and D
        else if (position === 1) whiteKeyIndex = 1; // D# between D and E
        else if (position === 2) whiteKeyIndex = 3; // F# between F and G
        else if (position === 3) whiteKeyIndex = 4; // G# between G and A
        else if (position === 4) whiteKeyIndex = 5; // A# between A and B
        
        // Account for octave offset (7 white keys per octave)
        const octaveOffset = (octave - 4) * 7 * 50;
        // Center black key perfectly in the crevice/gap between two white keys
        // White keys are 50px wide with 1px borders and -1px margin-right (overlap)
        // Position black keys where the red lines indicate - centered in the middle of the gap
        const whiteKeyWidth = 50;
        const blackKeyWidth = 32;
        // Increased offset significantly to align with red line markers in the crevices
        // This positions black keys perfectly centered where the gaps are widest
        const centerOffset = (whiteKeyWidth / 2) - (blackKeyWidth / 2) + 6;
        const leftOffset = octaveOffset + (whiteKeyIndex * whiteKeyWidth) + centerOffset;
        key.style.left = `${leftOffset}px`;
        
        if (this.showNoteNames) {
            const label = document.createElement('div');
            label.className = 'key-label';
            // Show both sharp and flat names (e.g., C#/Db)
            const flatNote = this.getFlatNote(note);
            label.textContent = `${note}/${flatNote}`;
            key.appendChild(label);
        }
        
        return key;
    }

    getFlatNote(sharpNote) {
        const flatMap = {
            'C#': 'Db',
            'D#': 'Eb',
            'F#': 'Gb',
            'G#': 'Ab',
            'A#': 'Bb'
        };
        return flatMap[sharpNote] || sharpNote;
    }

    getFrequency(note) {
        // A4 = 440 Hz - Full range C2 to C7
        const noteFrequencies = {
            'C2': 65.41, 'C#2': 69.30, 'D2': 73.42, 'D#2': 77.78,
            'E2': 82.41, 'F2': 87.31, 'F#2': 92.50, 'G2': 98.00,
            'G#2': 103.83, 'A2': 110.00, 'A#2': 116.54, 'B2': 123.47,
            'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56,
            'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00,
            'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
            'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13,
            'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00,
            'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
            'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25,
            'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99,
            'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,
            'C6': 1046.50, 'C#6': 1108.73, 'D6': 1174.66, 'D#6': 1244.51,
            'E6': 1318.51, 'F6': 1396.91, 'F#6': 1479.98, 'G6': 1567.98,
            'G#6': 1661.22, 'A6': 1760.00, 'A#6': 1864.66, 'B6': 1975.53,
            'C7': 2093.00
        };
        
        return noteFrequencies[note] || 440;
    }

    playNote(note, frequency) {
        if (!this.audioContext) {
            this.initAudioContext();
        }

        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        // Envelope for smoother sound
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

        oscillator.start(now);
        oscillator.stop(now + 0.5);

        return oscillator;
    }

    pressKey(note) {
        if (this.pressedKeys.has(note)) return;

        this.pressedKeys.add(note);
        const keyElement = this.keys.find(k => k.note === note)?.element;
        
        if (keyElement) {
            keyElement.classList.add('pressed');
            const frequency = parseFloat(keyElement.dataset.frequency);
            this.playNote(note, frequency);
        }
    }

    releaseKey(note) {
        this.pressedKeys.delete(note);
        const keyElement = this.keys.find(k => k.note === note)?.element;
        if (keyElement) {
            keyElement.classList.remove('pressed');
            // Clear any highlight timeout and reset background
            if (this.highlightTimeouts.has(note)) {
                clearTimeout(this.highlightTimeouts.get(note));
                this.highlightTimeouts.delete(note);
            }
            // Reset background if not pressed
            if (!keyElement.classList.contains('pressed')) {
                keyElement.style.background = '';
            }
        }
    }

    highlightKey(note, color = 'var(--key-pressed)') {
        const keyElement = this.keys.find(k => k.note === note)?.element;
        if (keyElement && this.highlightKeys) {
            // Clear any existing timeout for this key
            if (this.highlightTimeouts.has(note)) {
                clearTimeout(this.highlightTimeouts.get(note));
            }
            keyElement.style.background = color;
            const timeout = setTimeout(() => {
                if (!keyElement.classList.contains('pressed')) {
                    keyElement.style.background = '';
                }
                this.highlightTimeouts.delete(note);
            }, 500);
            this.highlightTimeouts.set(note, timeout);
        }
    }

    setupEventListeners() {
        const keyboard = document.getElementById('piano-keyboard');
        
        // Mouse events
        keyboard.addEventListener('mousedown', (e) => {
            const key = e.target.closest('.piano-key');
            if (key) {
                const note = key.dataset.note;
                this.pressKey(note);
                if (window.app) {
                    window.app.onKeyPress(note);
                }
            }
        });

        keyboard.addEventListener('mouseup', (e) => {
            const key = e.target.closest('.piano-key');
            if (key) {
                const note = key.dataset.note;
                this.releaseKey(note);
            }
        });

        // Global mouseup to ensure keys are released even if mouseup happens outside
        document.addEventListener('mouseup', () => {
            // Release all currently pressed keys
            const pressedNotes = Array.from(this.pressedKeys);
            pressedNotes.forEach(note => this.releaseKey(note));
        });

        keyboard.addEventListener('mouseleave', () => {
            // Release all pressed keys when mouse leaves keyboard
            const pressedNotes = Array.from(this.pressedKeys);
            pressedNotes.forEach(note => this.releaseKey(note));
        });

        // Keyboard events
        const keyMap = {
            'a': 'C4', 'w': 'C#4', 's': 'D4', 'e': 'D#4', 'd': 'E4',
            'f': 'F4', 't': 'F#4', 'g': 'G4', 'y': 'G#4', 'h': 'A4',
            'u': 'A#4', 'j': 'B4', 'k': 'C5', 'o': 'C#5', 'l': 'D5',
            'p': 'D#5', ';': 'E5', "'": 'F5'
        };

        document.addEventListener('keydown', (e) => {
            const note = keyMap[e.key.toLowerCase()];
            if (note && !this.pressedKeys.has(note)) {
                this.pressKey(note);
                if (window.app) {
                    window.app.onKeyPress(note);
                }
            }
        });

        document.addEventListener('keyup', (e) => {
            const note = keyMap[e.key.toLowerCase()];
            if (note) {
                this.releaseKey(note);
            }
        });

        // Toggle note names
        document.getElementById('show-note-names').addEventListener('change', (e) => {
            this.showNoteNames = e.target.checked;
            this.createKeyboard();
        });

        // Toggle key highlighting
        document.getElementById('highlight-keys').addEventListener('change', (e) => {
            this.highlightKeys = e.target.checked;
        });
    }

    getNoteDisplay(note) {
        const noteMap = {
            'C': 'C', 'C#': 'C♯', 'D': 'D', 'D#': 'D♯',
            'E': 'E', 'F': 'F', 'F#': 'F♯', 'G': 'G',
            'G#': 'G♯', 'A': 'A', 'A#': 'A♯', 'B': 'B'
        };
        
        const match = note.match(/([A-G]#?)(\d)/);
        if (match) {
            return `${noteMap[match[1]]}${match[2]}`;
        }
        return note;
    }
}

