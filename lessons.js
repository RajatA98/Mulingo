// Lesson System for Mulingo - Music Learning App

const lessons = [
    {
        id: 1,
        title: "Introduction to Piano Keys",
        description: "Learn the basic layout of piano keys",
        instruction: "Click on any white key to hear its sound. Notice how the keys are arranged!",
        type: "exploration",
        exercises: []
    },
    {
        id: 2,
        title: "Learning C, D, E",
        description: "Master the first three white keys",
        instruction: "Let's learn the notes C, D, and E. Click on each key as it's highlighted!",
        type: "sequence",
        exercises: [
            {
                type: "play_sequence",
                notes: ["C4", "D4", "E4"],
                instruction: "Play C, then D, then E"
            }
        ]
    },
    {
        id: 3,
        title: "Learning F, G, A, B",
        description: "Complete the white keys",
        instruction: "Now let's learn F, G, A, and B. These complete the musical alphabet!",
        type: "sequence",
        exercises: [
            {
                type: "play_sequence",
                notes: ["F4", "G4", "A4", "B4"],
                instruction: "Play F, then G, then A, then B"
            }
        ]
    },
    {
        id: 4,
        title: "C Major Scale",
        description: "Play your first scale",
        instruction: "A scale is a series of notes. Let's play the C Major scale: C-D-E-F-G-A-B-C",
        type: "sequence",
        exercises: [
            {
                type: "play_sequence",
                notes: ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"],
                instruction: "Play the C Major scale from C4 to C5"
            }
        ]
    },
    {
        id: 5,
        title: "Simple Melody: Twinkle Twinkle",
        description: "Play your first song!",
        instruction: "Let's play 'Twinkle Twinkle Little Star'. Follow the notes!",
        type: "melody",
        exercises: [
            {
                type: "play_sequence",
                notes: ["C4", "C4", "G4", "G4", "A4", "A4", "G4", "F4", "F4", "E4", "E4", "D4", "D4", "C4"],
                instruction: "Play: C-C-G-G-A-A-G-F-F-E-E-D-D-C"
            }
        ]
    },
    {
        id: 6,
        title: "Black Keys Introduction",
        description: "Learn about sharps and flats",
        instruction: "Black keys are sharps (#) or flats (♭). They're between certain white keys!",
        type: "exploration",
        exercises: []
    },
    {
        id: 7,
        title: "Chords: C Major",
        description: "Play your first chord",
        instruction: "A chord is multiple notes played together. C Major is C-E-G",
        type: "chord",
        exercises: [
            {
                type: "play_chord",
                notes: ["C4", "E4", "G4"],
                instruction: "Play C, E, and G together (or one after another)"
            }
        ]
    },
    {
        id: 8,
        title: "Simple Melody: Happy Birthday",
        description: "Play a familiar tune",
        instruction: "Let's play 'Happy Birthday'!",
        type: "melody",
        exercises: [
            {
                type: "play_sequence",
                notes: ["C4", "C4", "D4", "C4", "F4", "E4", "C4", "C4", "D4", "C4", "G4", "F4"],
                instruction: "Play the first part of Happy Birthday"
            }
        ]
    }
];

class LessonManager {
    constructor() {
        this.currentLessonIndex = 0;
        this.currentExerciseIndex = 0;
        this.currentLesson = null;
        this.currentExercise = null;
        this.exerciseProgress = [];
        this.currentNoteIndex = 0; // Track which note is currently displayed
        this.exerciseSheetMusic = null; // Reference to SheetMusic instance for exercise panel
        this.init();
    }

    init() {
        this.renderLessonsList();
        this.loadLesson(0);
        this.setupExerciseNavigation();
        // Initialize exercise sheet music after DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initExerciseSheetMusic());
        } else {
            this.initExerciseSheetMusic();
        }
    }

    initExerciseSheetMusic() {
        // Create a separate SheetMusic instance for the exercise panel
        const exerciseSvg = document.getElementById('exercise-staff-svg');
        if (exerciseSvg) {
            // Create a new SheetMusic instance
            this.exerciseSheetMusic = new SheetMusic();
            // Override to use exercise SVG instead of the main one
            this.exerciseSheetMusic.svg = exerciseSvg;
            // Clear any notes and initialize with treble clef
            if (this.exerciseSheetMusic.clearNotes) {
                this.exerciseSheetMusic.clearNotes();
            }
            this.exerciseSheetMusic.updateClef('treble');
        }
    }

    setupExerciseNavigation() {
        const prevBtn = document.getElementById('prev-note-btn');
        const nextBtn = document.getElementById('next-note-btn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.navigateNote(-1));
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.navigateNote(1));
        }
    }

    navigateNote(direction) {
        if (!this.currentExercise || !this.currentExercise.notes) return;
        
        const newIndex = this.currentNoteIndex + direction;
        if (newIndex >= 0 && newIndex < this.currentExercise.notes.length) {
            this.currentNoteIndex = newIndex;
            this.updateExerciseNoteDisplay();
        }
    }

    updateExerciseNoteDisplay() {
        if (!this.currentExercise) return;
        
        // Ensure exercise sheet music is initialized
        if (!this.exerciseSheetMusic) {
            this.initExerciseSheetMusic();
        }
        
        if (!this.exerciseSheetMusic) return;
        
        const currentNote = this.currentExercise.notes[this.currentNoteIndex];
        if (currentNote) {
            // Display the note on the staff (black by default)
            this.showNoteOnExerciseStaff(currentNote, '#000');
            
            // Update note counter
            const counter = document.getElementById('note-counter');
            if (counter) {
                counter.textContent = `${this.currentNoteIndex + 1} / ${this.currentExercise.notes.length}`;
            }
            
            // Update navigation button states
            const prevBtn = document.getElementById('prev-note-btn');
            const nextBtn = document.getElementById('next-note-btn');
            if (prevBtn) {
                prevBtn.disabled = this.currentNoteIndex === 0;
            }
            if (nextBtn) {
                nextBtn.disabled = this.currentNoteIndex === this.currentExercise.notes.length - 1;
            }
        }
    }

    showNoteOnExerciseStaff(note, color = '#000') {
        if (!this.exerciseSheetMusic || !this.exerciseSheetMusic.svg) return;
        
        // Clear previous notes
        const existingNotes = this.exerciseSheetMusic.svg.querySelectorAll('.music-note, .ledger-line, .octave-notation');
        existingNotes.forEach(el => {
            try {
                el.remove();
            } catch (e) {
                // Ignore if already removed
            }
        });

        // Convert to preferred format (sharp or flat)
        const displayNote = this.exerciseSheetMusic.getDisplayNote(note);

        // Parse note
        const parsed = this.exerciseSheetMusic.parseNote(displayNote);
        if (!parsed) {
            console.log('Could not parse note:', note);
            return;
        }

        let { noteName, octave, isSharp, isFlat, accidental } = parsed;
        
        // Determine clef and octave shift (same logic as addNote)
        let octaveShift = 0;
        let clef = this.exerciseSheetMusic.getClefForNote(octave, noteName);
        
        if (clef === 'treble') {
            if (octave >= 6) {
                octaveShift = -1;
            } else if (octave <= 3) {
                clef = 'bass';
                octaveShift = 0;
            }
        }
        
        if (clef === 'bass') {
            if (octave <= 1) {
                octaveShift = 1;
            } else if (octave >= 4) {
                clef = 'treble';
                octaveShift = 0;
            }
        }
        
        const displayOctave = octave + octaveShift;
        
        // Update clef if needed
        this.exerciseSheetMusic.updateClef(clef);
        
        // Calculate y position on staff
        const yPosition = this.exerciseSheetMusic.getNoteYPosition(noteName, displayOctave);
        
        // Draw the note with the specified color (drawNote handles ledger lines and octave notation)
        const centerX = 110;
        this.exerciseSheetMusic.drawNote(centerX, yPosition, noteName, displayOctave, accidental, octaveShift, color);
    }

    renderLessonsList() {
        const list = document.getElementById('lessons-list');
        list.innerHTML = '';

        lessons.forEach((lesson, index) => {
            const item = document.createElement('div');
            item.className = 'lesson-item';
            if (index === this.currentLessonIndex) {
                item.classList.add('active');
            }
            item.innerHTML = `
                <h4>${lesson.title}</h4>
                <p>${lesson.description}</p>
            `;
            item.addEventListener('click', () => this.loadLesson(index));
            list.appendChild(item);
        });
    }

    loadLesson(index) {
        if (index < 0 || index >= lessons.length) return;

        this.currentLessonIndex = index;
        this.currentLesson = lessons[index];
        this.currentExerciseIndex = 0;
        this.exerciseProgress = [];

        // Update UI
        document.getElementById('lesson-title').textContent = this.currentLesson.title;
        document.getElementById('instruction-text').textContent = this.currentLesson.instruction;
        document.getElementById('lesson-number').textContent = `Lesson ${this.currentLesson.id}`;
        
        // Show/hide scrolling sheet music for melody lessons
        const songSheetMusicContainer = document.getElementById('song-sheet-music-container');
        if (this.currentLesson.type === 'melody') {
            if (songSheetMusicContainer) {
                songSheetMusicContainer.style.display = 'block';
            }
            // Clear scrolling sheet music
            if (window.scrollingSheetMusic) {
                window.scrollingSheetMusic.clear();
            }
        } else {
            if (songSheetMusicContainer) {
                songSheetMusicContainer.style.display = 'none';
            }
        }
        
        // Update progress
        this.updateProgress();

        // Show/hide exercise panel
        const exercisePanel = document.getElementById('exercise-panel');
        if (this.currentLesson.exercises.length > 0) {
            exercisePanel.style.display = 'block';
            this.loadExercise(0);
        } else {
            exercisePanel.style.display = 'none';
        }

        // Update lesson list
        this.renderLessonsList();

        // Reset buttons
        document.getElementById('start-lesson-btn').style.display = 'block';
        document.getElementById('next-lesson-btn').style.display = 'none';
    }

    loadExercise(index) {
        if (!this.currentLesson || index >= this.currentLesson.exercises.length) return;

        this.currentExerciseIndex = index;
        this.currentExercise = this.currentLesson.exercises[index];
        this.exerciseProgress = [];
        this.currentNoteIndex = 0; // Reset to first note

        const exercisePanel = document.getElementById('exercise-panel');
        document.getElementById('exercise-instruction').textContent = this.currentExercise.instruction;

        // Hide the old target-notes div (we're using staff display now)
        const targetNotes = document.getElementById('target-notes');
        targetNotes.style.display = 'none';
        targetNotes.innerHTML = '';

        // For melody lessons, load all notes for sight reading
        if (this.currentLesson.type === 'melody' && window.scrollingSheetMusic && this.currentExercise.notes) {
            window.scrollingSheetMusic.loadMelody(this.currentExercise.notes);
        }

        // Display the first note on the staff (for non-melody lessons)
        if (this.currentLesson.type !== 'melody' && this.exerciseSheetMusic && this.currentExercise.notes.length > 0) {
            this.updateExerciseNoteDisplay();
        }

        // Clear feedback
        const feedback = document.getElementById('feedback');
        feedback.textContent = '';
        feedback.className = 'feedback';
    }

    checkNote(note) {
        if (!this.currentExercise) return false;

        const isMelody = this.currentLesson && this.currentLesson.type === 'melody';

        if (this.currentExercise.type === 'play_sequence') {
            // Get the current expected note based on progress
            const expectedNoteIndex = this.exerciseProgress.length;
            const expectedNote = this.currentExercise.notes[expectedNoteIndex];
            
            // Keep currentNoteIndex in sync with progress
            this.currentNoteIndex = expectedNoteIndex;
            
            if (note === expectedNote) {
                // Correct note!
                // For melodies, highlight the note in the scrolling display
                if (isMelody && window.scrollingSheetMusic) {
                    window.scrollingSheetMusic.highlightNote(expectedNoteIndex, true);
                } else if (!isMelody) {
                    this.showNoteOnExerciseStaff(note, '#10b981'); // Green color
                }
                this.exerciseProgress.push(note);
                
                // Auto-advance to next note after a short delay (only for non-melodies)
                if (!isMelody) {
                    setTimeout(() => {
                        if (this.exerciseProgress.length < this.currentExercise.notes.length) {
                            // Move to next note
                            this.currentNoteIndex = this.exerciseProgress.length;
                            this.updateExerciseNoteDisplay();
                        } else {
                            // Exercise complete
                            this.completeExercise();
                        }
                    }, 800); // 800ms delay to show green feedback
                } else {
                    // For melodies, check if complete
                    if (this.exerciseProgress.length === this.currentExercise.notes.length) {
                        setTimeout(() => {
                            this.completeExercise();
                        }, 500);
                    }
                }
                
                return true;
            } else {
                // Wrong note!
                // For melodies, highlight the current expected note as incorrect (red)
                if (isMelody && window.scrollingSheetMusic) {
                    // Highlight the expected note in red to show what should have been played
                    window.scrollingSheetMusic.highlightNote(expectedNoteIndex, false);
                } else if (!isMelody) {
                    this.showNoteOnExerciseStaff(note, '#ef4444'); // Red color
                    this.showFeedback('Try again! Play the correct note.', 'error');
                    
                    // After a short delay, show the expected note again in black
                    setTimeout(() => {
                        if (this.currentExercise && this.exerciseProgress.length < this.currentExercise.notes.length) {
                            this.currentNoteIndex = this.exerciseProgress.length;
                            this.updateExerciseNoteDisplay();
                        }
                    }, 1000); // 1 second delay to show red feedback
                } else {
                    this.showFeedback('Try again! Play the correct note.', 'error');
                }
                
                return false;
            }
        } else if (this.currentExercise.type === 'play_chord') {
            if (this.currentExercise.notes.includes(note) && !this.exerciseProgress.includes(note)) {
                // Correct note for chord! Show it in green
                this.showNoteOnExerciseStaff(note, '#10b981');
                this.exerciseProgress.push(note);
                
                if (this.exerciseProgress.length === this.currentExercise.notes.length) {
                    // All chord notes played
                    setTimeout(() => {
                        this.completeExercise();
                    }, 800);
                }
                return true;
            } else {
                // Wrong note for chord
                this.showNoteOnExerciseStaff(note, '#ef4444');
                this.showFeedback('Try again! Play one of the chord notes.', 'error');
                
                // Show expected notes again after delay
                setTimeout(() => {
                    if (this.currentExercise) {
                        this.currentNoteIndex = 0;
                        this.updateExerciseNoteDisplay();
                    }
                }, 1000);
                return false;
            }
        }

        return false;
    }

    updateExerciseDisplay() {
        const badges = document.querySelectorAll('.note-badge');
        badges.forEach((badge, index) => {
            const note = badge.dataset.note;
            if (this.exerciseProgress.includes(note)) {
                badge.classList.add('completed');
            }
        });
    }

    completeExercise() {
        this.showFeedback('Excellent! You completed the exercise!', 'success');
        
        // Check if there are more exercises
        if (this.currentExerciseIndex < this.currentLesson.exercises.length - 1) {
            setTimeout(() => {
                this.loadExercise(this.currentExerciseIndex + 1);
            }, 2000);
        } else {
            // Lesson completed
            document.getElementById('next-lesson-btn').style.display = 'block';
            this.updateProgress(100);
        }
    }

    showFeedback(message, type) {
        const feedback = document.getElementById('feedback');
        feedback.textContent = message;
        feedback.className = `feedback ${type}`;
    }

    updateProgress(percentage = null) {
        const progressFill = document.getElementById('progress-fill');
        if (percentage !== null) {
            progressFill.style.width = `${percentage}%`;
        } else {
            const totalLessons = lessons.length;
            const progress = ((this.currentLessonIndex + 1) / totalLessons) * 100;
            progressFill.style.width = `${progress}%`;
        }
    }

    formatNote(note) {
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

    nextLesson() {
        if (this.currentLessonIndex < lessons.length - 1) {
            this.loadLesson(this.currentLessonIndex + 1);
        }
    }

    resetLesson() {
        // Clear scrolling sheet music if it's a melody lesson
        if (this.currentLesson && this.currentLesson.type === 'melody' && window.scrollingSheetMusic) {
            window.scrollingSheetMusic.clear();
        }
        this.loadLesson(this.currentLessonIndex);
    }
}



