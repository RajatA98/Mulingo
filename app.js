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
            if (this.scrollingSheetMusic) {
                this.scrollingSheetMusic.clear();
            }
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
        document.getElementById('start-lesson-btn').style.display = 'none';
        
        const currentLesson = this.lessonManager.currentLesson;
        if (currentLesson && currentLesson.exercises.length > 0) {
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



