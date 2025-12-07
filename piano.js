// Piano Keyboard and Sound Generation

class Piano {
    constructor() {
        this.audioContext = null;
        this.keys = [];
        this.pressedKeys = new Set();
        this.showNoteNames = true;
        this.highlightKeys = true;
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

        // Piano keys: C4 to C6 (2 octaves)
        const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        const blackKeys = ['C#', 'D#', '', 'F#', 'G#', 'A#', ''];
        
        let keyIndex = 0;
        
        // Create 2 octaves
        for (let octave = 4; octave < 6; octave++) {
            for (let i = 0; i < whiteKeys.length; i++) {
                const note = whiteKeys[i];
                const fullNote = `${note}${octave}`;
                const key = this.createWhiteKey(fullNote, note, octave, keyIndex);
                keyboard.appendChild(key);
                this.keys.push({ element: key, note: fullNote, frequency: this.getFrequency(fullNote) });
                keyIndex++;
            }
        }

        // Add black keys
        keyIndex = 0;
        for (let octave = 4; octave < 6; octave++) {
            for (let i = 0; i < blackKeys.length; i++) {
                if (blackKeys[i]) {
                    const note = blackKeys[i];
                    const fullNote = `${note}${octave}`;
                    const key = this.createBlackKey(fullNote, note, octave, i, keyIndex);
                    keyboard.appendChild(key);
                    this.keys.push({ element: key, note: fullNote, frequency: this.getFrequency(fullNote) });
                }
                keyIndex++;
            }
        }
    }

    createWhiteKey(fullNote, note, octave, index) {
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

    createBlackKey(fullNote, note, octave, position, index) {
        const key = document.createElement('div');
        key.className = 'piano-key black-key';
        key.dataset.note = fullNote;
        key.dataset.frequency = this.getFrequency(fullNote);
        
        // Position black keys between white keys
        // Black keys are positioned at: C#(after C), D#(after D), F#(after F), G#(after G), A#(after A)
        // Position mapping: 0->C#, 1->D#, 2->F#, 3->G#, 4->A#
        let whiteKeyIndex;
        
        if (position === 0) whiteKeyIndex = 0; // C# after C
        else if (position === 1) whiteKeyIndex = 1; // D# after D
        else if (position === 2) whiteKeyIndex = 3; // F# after F
        else if (position === 3) whiteKeyIndex = 4; // G# after G
        else if (position === 4) whiteKeyIndex = 5; // A# after A
        
        // Account for octave offset (7 white keys per octave)
        const octaveOffset = (octave - 4) * 7 * 50;
        const leftOffset = octaveOffset + (whiteKeyIndex * 50) + 35; // 35px offset to center on white key
        key.style.left = `${leftOffset}px`;
        
        if (this.showNoteNames) {
            const label = document.createElement('div');
            label.className = 'key-label';
            label.textContent = note;
            key.appendChild(label);
        }
        
        return key;
    }

    getFrequency(note) {
        // A4 = 440 Hz
        const noteFrequencies = {
            'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13,
            'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00,
            'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
            'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25,
            'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99,
            'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,
            'C6': 1046.50
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
        }
    }

    highlightKey(note, color = 'var(--key-pressed)') {
        const keyElement = this.keys.find(k => k.note === note)?.element;
        if (keyElement && this.highlightKeys) {
            keyElement.style.background = color;
            setTimeout(() => {
                if (!keyElement.classList.contains('pressed')) {
                    keyElement.style.background = '';
                }
            }, 500);
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

        keyboard.addEventListener('mouseleave', () => {
            this.pressedKeys.forEach(note => this.releaseKey(note));
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

