// Simple Piano Keyboard - Step by Step

class Piano {
    constructor() {
        this.audioContext = null;
        this.keys = [];
        this.pressedKeys = new Set();
        this.showNoteNames = true;
        this.highlightKeys = true;
        this.highlightTimeouts = new Map();
        this.initAudioContext();
        this.createSimpleKeyboard();
        this.setupEventListeners();
    }

    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.error('Audio not supported');
        }
    }

    createSimpleKeyboard() {
        const keyboard = document.getElementById('piano-keyboard');
        keyboard.innerHTML = '';
        this.keys = [];

        // Simple 2 octave keyboard: C4 to B5 (24 keys)
        const notes = [
            'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4',
            'C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'F#5', 'G5', 'G#5', 'A5', 'A#5', 'B5'
        ];

        let whiteCount = 0;

        notes.forEach(note => {
            const isBlack = note.includes('#');
            const key = document.createElement('div');
            
            // Same base class for all keys
            key.className = 'key';
            
            // Add color class
            if (isBlack) {
                key.classList.add('black');
                key.style.left = (whiteCount * 50 - 15) + 'px';
            } else {
                key.classList.add('white');
                whiteCount++;
            }

            key.dataset.note = note;
            
            // Add note label
            const label = document.createElement('span');
            label.className = 'note-label';
            
            if (isBlack) {
                // Show both sharp and flat notation
                const noteName = note.replace(/\d/g, '');
                const flatName = this.toFlat(noteName);
                label.innerHTML = `${noteName}/<br>${flatName}`;
            } else {
                label.textContent = note.replace(/\d/g, '');
            }
            
            // Hide label if showNoteNames is false
            if (!this.showNoteNames) {
                label.style.display = 'none';
            }
            
            key.appendChild(label);

            keyboard.appendChild(key);
            this.keys.push({ element: key, note: note });
        });
    }

    toFlat(sharpNote) {
        const flatMap = {
            'C#': 'D♭',
            'D#': 'E♭',
            'F#': 'G♭',
            'G#': 'A♭',
            'A#': 'B♭'
        };
        return flatMap[sharpNote] || sharpNote;
    }

    setupEventListeners() {
        const keyboard = document.getElementById('piano-keyboard');
        
        keyboard.addEventListener('mousedown', (e) => {
            const key = e.target.closest('.key');
            if (key) {
                const note = key.dataset.note;
                
                // Only highlight if highlightKeys is enabled
                if (this.highlightKeys) {
                    key.classList.add('active');
                }
                
                this.playNote(note);
                
                // Notify app for sheet music display
                if (window.app) {
                    window.app.onKeyPress(note);
                }
            }
        });

        keyboard.addEventListener('mouseup', (e) => {
            const key = e.target.closest('.key');
            if (key) {
                key.classList.remove('active');
            }
        });

        document.addEventListener('mouseup', () => {
            this.keys.forEach(k => k.element.classList.remove('active'));
        });

        // Show/hide note names
        const showNoteNamesCheckbox = document.getElementById('show-note-names');
        if (showNoteNamesCheckbox) {
            showNoteNamesCheckbox.addEventListener('change', (e) => {
                this.showNoteNames = e.target.checked;
                // Toggle all labels
                this.keys.forEach(keyData => {
                    const label = keyData.element.querySelector('.note-label');
                    if (label) {
                        label.style.display = this.showNoteNames ? '' : 'none';
                    }
                });
            });
        }

        // Highlight keys toggle
        const highlightKeysCheckbox = document.getElementById('highlight-keys');
        if (highlightKeysCheckbox) {
            highlightKeysCheckbox.addEventListener('change', (e) => {
                this.highlightKeys = e.target.checked;
                
                // If disabled, remove all active states
                if (!this.highlightKeys) {
                    this.keys.forEach(keyData => {
                        keyData.element.classList.remove('active');
                    });
                }
            });
        }
    }

    playNote(note) {
        if (!this.audioContext) return;
        if (this.audioContext.state === 'suspended') this.audioContext.resume();

        const freq = this.getFrequency(note);
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';

        const now = this.audioContext.currentTime;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        
        osc.start(now);
        osc.stop(now + 0.5);
    }

    getFrequency(note) {
        const freq = {
            'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63,
            'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00,
            'A#4': 466.16, 'B4': 493.88, 'C5': 523.25, 'C#5': 554.37, 'D5': 587.33,
            'D#5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99,
            'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77
        };
        return freq[note] || 440;
    }
}

// Methods for app compatibility
Piano.prototype.pressKey = function(note) {
    const keyData = this.keys.find(k => k.note === note);
    if (keyData) {
        if (this.highlightKeys) {
            keyData.element.classList.add('active');
        }
        this.playNote(note);
    }
};

Piano.prototype.releaseKey = function(note) {
    const keyData = this.keys.find(k => k.note === note);
    if (keyData) {
        keyData.element.classList.remove('active');
    }
};

Piano.prototype.highlightKey = function(note) {
    const keyData = this.keys.find(k => k.note === note);
    if (keyData && this.highlightKeys) {
        keyData.element.classList.add('active');
        setTimeout(() => {
            keyData.element.classList.remove('active');
        }, 300);
    }
};

Piano.prototype.getNoteDisplay = function(note) {
    const symbols = {
        'C': 'C', 'C#': 'C♯', 'D': 'D', 'D#': 'D♯',
        'E': 'E', 'F': 'F', 'F#': 'F♯', 'G': 'G',
        'G#': 'G♯', 'A': 'A', 'A#': 'A♯', 'B': 'B'
    };
    const match = note.match(/([A-G]#?)(\d)/);
    return match ? `${symbols[match[1]]}${match[2]}` : note;
};
