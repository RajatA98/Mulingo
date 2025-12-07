// Lesson System for Piano Learning

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
        this.init();
    }

    init() {
        this.renderLessonsList();
        this.loadLesson(0);
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

        const exercisePanel = document.getElementById('exercise-panel');
        document.getElementById('exercise-instruction').textContent = this.currentExercise.instruction;

        // Display target notes
        const targetNotes = document.getElementById('target-notes');
        targetNotes.innerHTML = '';
        
        if (this.currentExercise.type === 'play_sequence') {
            this.currentExercise.notes.forEach((note, i) => {
                const badge = document.createElement('div');
                badge.className = 'note-badge';
                badge.textContent = this.formatNote(note);
                badge.dataset.note = note;
                badge.dataset.index = i;
                targetNotes.appendChild(badge);
            });
        } else if (this.currentExercise.type === 'play_chord') {
            this.currentExercise.notes.forEach((note, i) => {
                const badge = document.createElement('div');
                badge.className = 'note-badge';
                badge.textContent = this.formatNote(note);
                badge.dataset.note = note;
                targetNotes.appendChild(badge);
            });
        }

        // Clear feedback
        const feedback = document.getElementById('feedback');
        feedback.textContent = '';
        feedback.className = 'feedback';
    }

    checkNote(note) {
        if (!this.currentExercise) return false;

        if (this.currentExercise.type === 'play_sequence') {
            const expectedNote = this.currentExercise.notes[this.exerciseProgress.length];
            if (note === expectedNote) {
                this.exerciseProgress.push(note);
                this.updateExerciseDisplay();
                
                if (this.exerciseProgress.length === this.currentExercise.notes.length) {
                    this.completeExercise();
                }
                return true;
            } else {
                this.showFeedback('Try again! Play the correct note.', 'error');
                return false;
            }
        } else if (this.currentExercise.type === 'play_chord') {
            if (this.currentExercise.notes.includes(note) && !this.exerciseProgress.includes(note)) {
                this.exerciseProgress.push(note);
                this.updateExerciseDisplay();
                
                if (this.exerciseProgress.length === this.currentExercise.notes.length) {
                    this.completeExercise();
                }
                return true;
            }
            return false;
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
        this.loadLesson(this.currentLessonIndex);
    }
}



