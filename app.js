// Main Application Controller

class PianoLearningApp {
    constructor() {
        this.piano = null;
        this.lessonManager = null;
        this.sheetMusic = null;
        this.init();
    }

    init() {
        // Initialize piano and lesson manager
        this.piano = new Piano();
        this.lessonManager = new LessonManager();
        this.sheetMusic = new SheetMusic();

        // Make app globally accessible
        window.app = this;
        window.piano = this.piano;
        window.lessonManager = this.lessonManager;
        window.sheetMusic = this.sheetMusic;

        // Setup UI event listeners
        this.setupUIListeners();
    }

    setupUIListeners() {
        // Start lesson button
        document.getElementById('start-lesson-btn').addEventListener('click', () => {
            this.startLesson();
        });

        // Next lesson button
        document.getElementById('next-lesson-btn').addEventListener('click', () => {
            this.lessonManager.nextLesson();
            document.getElementById('start-lesson-btn').style.display = 'block';
            document.getElementById('next-lesson-btn').style.display = 'none';
        });

        // Reset lesson button
        document.getElementById('reset-lesson-btn').addEventListener('click', () => {
            this.lessonManager.resetLesson();
            document.getElementById('start-lesson-btn').style.display = 'block';
            document.getElementById('next-lesson-btn').style.display = 'none';
            // Clear sheet music when resetting
            if (this.sheetMusic) {
                this.sheetMusic.clear();
            }
        });
    }

    startLesson() {
        document.getElementById('start-lesson-btn').style.display = 'none';
        
        const currentLesson = this.lessonManager.currentLesson;
        if (currentLesson && currentLesson.exercises.length > 0) {
            this.lessonManager.loadExercise(0);
        }
    }

    onKeyPress(note) {
        // Highlight the key
        this.piano.highlightKey(note);

        // Add note to sheet music
        if (this.sheetMusic) {
            this.sheetMusic.addNote(note);
        }

        // Check if we're in an exercise
        if (this.lessonManager.currentExercise) {
            this.lessonManager.checkNote(note);
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PianoLearningApp();
});



