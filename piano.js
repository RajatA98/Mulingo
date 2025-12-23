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
        // Hide wrapper before creating keyboard to prevent left-side flash
        const wrapper = document.querySelector('.piano-wrapper');
        if (wrapper) {
            wrapper.style.visibility = 'hidden';
        }
        this.createSimpleKeyboard();
        this.setupEventListeners();
        this.scrollToMiddleC();
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

        // Generate all 88 keys: A0 to C8
        const notes = this.generateAllNotes();

        let whiteCount = 0;
        const whiteKeyPositions = new Map(); // Track white key positions

        notes.forEach(note => {
            const isBlack = note.includes('#');
            const key = document.createElement('div');
            
            // Same base class for all keys
            key.className = 'key';
            
            // Add color class
            if (isBlack) {
                key.classList.add('black');
                // Position black key centered between two white keys
                // Keyboard container has padding: 10px
                // White keys are 50px wide, positioned in flexbox starting at 10px (padding)
                // When processing a black key, whiteCount is the index of the white key that came BEFORE it
                // White key at whiteCount: left edge at (10px + whiteCount * 50px), right edge at (10px + whiteCount * 50px + 50px)
                // White key at whiteCount + 1: left edge at (10px + (whiteCount + 1) * 50px)
                // Center point between them: (right edge of whiteCount + left edge of whiteCount+1) / 2
                // = (10 + whiteCount * 50 + 50 + 10 + (whiteCount + 1) * 50) / 2
                // = (20 + whiteCount * 50 + 50 + whiteCount * 50 + 50) / 2
                // = (20 + 2 * whiteCount * 50 + 100) / 2 = 10 + whiteCount * 50 + 50
                // Black key is 30px wide, so left edge = center - 15 = 10 + whiteCount * 50 + 50 - 15 = 10 + whiteCount * 50 + 35
                const leftPosition = 10 + (whiteCount * 50) + 35;
                key.style.left = Math.round(leftPosition) + 'px';
            } else {
                key.classList.add('white');
                // Store the position of this white key for potential future use
                whiteKeyPositions.set(note, whiteCount);
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
        
        // Ensure the keyboard container is wide enough for all keys
        const totalWhiteKeys = whiteCount;
        const keyboardWidth = totalWhiteKeys * 50;
        keyboard.style.minWidth = keyboardWidth + 'px';
    }

    generateAllNotes() {
        // Generate all 88 keys from A0 to C8
        const notes = [];
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        
        // Start from A0
        notes.push('A0', 'A#0', 'B0');
        
        // Add full octaves 1-7
        for (let octave = 1; octave <= 7; octave++) {
            noteNames.forEach(note => {
                notes.push(note + octave);
            });
        }
        
        // End with C8
        notes.push('C8');
        
        return notes;
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

    scrollToMiddleC() {
        // Scroll to middle C (C4) on initialization without showing left side first
        const wrapper = document.querySelector('.piano-wrapper');
        if (!wrapper) return;
        
        // Find C4 key
        const c4Key = this.keys.find(k => k.note === 'C4');
        if (c4Key && c4Key.element) {
            // Calculate C4 position immediately
            let whiteKeyIndex = 0;
            const notes = this.generateAllNotes();
            for (let i = 0; i < notes.length; i++) {
                if (notes[i] === 'C4') {
                    // Count white keys before C4
                    for (let j = 0; j < i; j++) {
                        if (!notes[j].includes('#')) {
                            whiteKeyIndex++;
                        }
                    }
                    break;
                }
            }
            
            // Wait for layout, then set scroll position and make visible
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    // Calculate scroll position: center C4 in viewport
                    // White key width is 50px, keyboard padding is 10px
                    const c4Position = (whiteKeyIndex * 50) + 10; // Position of C4 key left edge relative to keyboard
                    const scrollPosition = c4Position - (wrapper.clientWidth / 2) + 25; // Center it (25 = half key width)
                    
                    // Set scroll position immediately (before making visible)
                    wrapper.scrollLeft = Math.max(0, scrollPosition);
                    
                    // Force a reflow to ensure scroll position is set
                    void wrapper.offsetHeight;
                    
                    // Now make it visible
                    wrapper.style.visibility = 'visible';
                });
            });
        } else {
            wrapper.style.visibility = 'visible';
        }
    }

    playNote(note) {
        if (!this.audioContext) return;
        if (this.audioContext.state === 'suspended') this.audioContext.resume();

        const freq = this.getFrequency(note);
        
        // For very low frequencies (bass notes), use a longer duration and higher gain
        const isBassNote = freq < 100; // Notes below 100Hz
        const duration = isBassNote ? 1.0 : 0.5;
        const maxGain = isBassNote ? 0.5 : 0.3;
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';

        const now = this.audioContext.currentTime;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(maxGain, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
        
        osc.start(now);
        osc.stop(now + duration);
    }

    getFrequency(note) {
        // Calculate frequency using the formula: f = 440 * 2^((n-69)/12)
        // where n is the MIDI note number (A4 = 69)
        const midiNoteMap = {
            'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
            'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
        };
        
        const match = note.match(/([A-G]#?)(\d)/);
        if (!match) {
            console.warn('Invalid note format:', note);
            return 440;
        }
        
        const noteName = match[1];
        const octave = parseInt(match[2]);
        const noteNumber = midiNoteMap[noteName];
        
        if (noteNumber === undefined) {
            console.warn('Unknown note name:', noteName);
            return 440;
        }
        
        // MIDI note number: (octave + 1) * 12 + noteNumber
        // A4 (440 Hz) is MIDI note 69
        // A0 is MIDI note 21, C8 is MIDI note 108
        const midiNote = (octave + 1) * 12 + noteNumber;
        
        // Calculate frequency: f = 440 * 2^((midiNote - 69)/12)
        const frequency = 440 * Math.pow(2, (midiNote - 69) / 12);
        
        // Ensure frequency is valid (Web Audio API supports 0.1 Hz to sampleRate/2)
        if (frequency < 0.1 || frequency > 24000) {
            console.warn('Frequency out of range:', frequency, 'for note:', note);
            return Math.max(0.1, Math.min(24000, frequency));
        }
        
        return frequency;
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
