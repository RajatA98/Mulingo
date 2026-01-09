// Main Application Controller

class PianoLearningApp {
    constructor() {
        this.piano = null;
        this.lessonManager = null;
        this.sheetMusic = null;
        this.scrollingSheetMusic = null;
        this.init();
    }

    init() {
        // Initialize piano and lesson manager
        this.piano = new Piano();
        this.lessonManager = new LessonManager();
        this.sheetMusic = new SheetMusic();
        this.scrollingSheetMusic = new ScrollingSheetMusic();

        // Make app globally accessible
        window.app = this;
        window.piano = this.piano;
        window.lessonManager = this.lessonManager;
        window.sheetMusic = this.sheetMusic;
        window.scrollingSheetMusic = this.scrollingSheetMusic;

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
            // nextLesson will call loadLesson which handles button state
            this.lessonManager.nextLesson();
        });

        // Reset lesson button
        document.getElementById('reset-lesson-btn').addEventListener('click', () => {
            // Clear sheet music when resetting
            if (this.sheetMusic) {
                this.sheetMusic.clear();
            }
            if (this.scrollingSheetMusic) {
                this.scrollingSheetMusic.clear();
            }
            // Reset lesson will reload the lesson and handle button state
            this.lessonManager.resetLesson();
        });

        // Prefer flats toggle
        document.getElementById('prefer-flats').addEventListener('change', (e) => {
            if (this.sheetMusic) {
                this.sheetMusic.setFlatPreference(e.target.checked);
            }
            if (this.scrollingSheetMusic) {
                this.scrollingSheetMusic.setFlatPreference(e.target.checked);
            }
        });
    }

    startLesson() {
        const currentLesson = this.lessonManager.currentLesson;
        
        // If lesson has navigateToNextOnStart flag, navigate to next lesson instead
        if (currentLesson && currentLesson.navigateToNextOnStart) {
            this.lessonManager.nextLesson();
            return;
        }
        
        document.getElementById('start-lesson-btn').style.display = 'none';
        
        if (currentLesson && currentLesson.exercises.length > 0) {
            // Show the exercise panel
            const exercisePanel = document.getElementById('exercise-panel');
            exercisePanel.style.display = 'block';
            // Load the first exercise
            this.lessonManager.loadExercise(0);
        }
    }

    onKeyPress(note) {
        // Highlight the key
        this.piano.highlightKey(note);

        // Check if we're in a melody lesson
        const currentLesson = this.lessonManager.currentLesson;
        const isMelody = currentLesson && currentLesson.type === 'melody';
        
        if (isMelody) {
            // For melodies, notes are pre-rendered and highlighting is handled by checkNote
            if (this.lessonManager.currentExercise) {
                this.lessonManager.checkNote(note);
            }
        } else if (this.sheetMusic) {
            // Use regular sheet music for other lessons
            this.sheetMusic.addNote(note);
            
            // Check if we're in an exercise
            if (this.lessonManager.currentExercise) {
                this.lessonManager.checkNote(note);
            }
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PianoLearningApp();
});



