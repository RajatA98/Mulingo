// Sheet Music Display

class SheetMusic {
    constructor() {
        this.svg = null;
        this.notePosition = 100; // Starting x position for notes
        this.noteSpacing = 40; // Space between notes
        this.maxNotes = 15; // Maximum notes to show before scrolling
        this.playedNotes = []; // Array of {note, x, y, duration}
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupSVG());
        } else {
            this.setupSVG();
        }
    }

    setupSVG() {
        this.svg = document.getElementById('staff-svg');
        if (!this.svg) {
            console.error('Staff SVG not found');
            return;
        }
        // Initialize with treble clef (default for C4-C6 range)
        this.updateClef('treble');
        // Clear any existing notes (keep staff lines and clef)
        this.clearNotes();
    }

    clearNotes() {
        // Remove all note elements but keep staff lines and clef
        if (this.svg) {
            const notes = this.svg.querySelectorAll('.music-note, .ledger-line');
            notes.forEach(note => note.remove());
        }
        this.playedNotes = [];
        this.notePosition = 100;
    }

    addNote(note) {
        // Make sure SVG is available
        if (!this.svg) {
            this.setupSVG();
            if (!this.svg) return;
        }

        // Clear previous note - show only one note at a time
        this.clearNotes();

        // Parse note (e.g., "C4", "C#4", "D4")
        const parsed = this.parseNote(note);
        if (!parsed) {
            console.log('Could not parse note:', note);
            return;
        }

        const { noteName, octave, isSharp } = parsed;
        
        // Determine which clef to use
        const clef = this.getClefForNote(octave);
        this.updateClef(clef);
        
        // Calculate y position on staff
        const yPosition = this.getNoteYPosition(noteName, octave);
        
        // Add note to array (only one note now)
        this.playedNotes = [{
            note: note,
            x: 100, // Center position for smaller square
            y: yPosition,
            noteName: noteName,
            octave: octave,
            isSharp: isSharp
        }];

        // Draw the note (centered on staff - smaller square)
        const centerX = 100; // Center of the smaller square staff
        this.drawNote(centerX, yPosition, noteName, octave, isSharp);
    }

    updateClef(clef) {
        if (!this.svg) return;
        
        // Remove all existing clef elements (text and dots)
        const existingClefs = this.svg.querySelectorAll('.clef');
        existingClefs.forEach(el => el.remove());

        // Add new clef
        const clefElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        clefElement.classList.add('clef');
        clefElement.setAttribute('font-family', 'serif');
        clefElement.setAttribute('font-size', '48');
        clefElement.setAttribute('fill', '#000');
        clefElement.setAttribute('font-weight', 'bold');
        
        if (clef === 'treble') {
            // Treble clef - use a music symbol
            clefElement.setAttribute('x', '15');
            clefElement.setAttribute('y', '110');
            clefElement.textContent = '𝄞'; // Treble clef symbol
        } else {
            // Bass clef - draw two dots and a symbol
            clefElement.setAttribute('x', '20');
            clefElement.setAttribute('y', '100');
            clefElement.textContent = '𝄢'; // Bass clef symbol
            // Add two dots for bass clef
            const dot1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            dot1.setAttribute('cx', '45');
            dot1.setAttribute('cy', '85');
            dot1.setAttribute('r', '2.5');
            dot1.setAttribute('fill', '#000');
            dot1.classList.add('clef');
            this.svg.appendChild(dot1);
            
            const dot2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            dot2.setAttribute('cx', '45');
            dot2.setAttribute('cy', '105');
            dot2.setAttribute('r', '2.5');
            dot2.setAttribute('fill', '#000');
            dot2.classList.add('clef');
            this.svg.appendChild(dot2);
        }
        
        this.svg.appendChild(clefElement);
    }

    parseNote(note) {
        // Parse note like "C4", "C#4", "D4", etc.
        const match = note.match(/([A-G])(#)?(\d)/);
        if (!match) return null;

        const noteName = match[1];
        const isSharp = match[2] === '#';
        const octave = parseInt(match[3]);

        return { noteName, octave, isSharp };
    }

    getNoteYPosition(noteName, octave) {
        // Staff line positions: 40 (top/F5), 60 (D5), 80 (B4), 100 (G4), 120 (E4/bottom)
        // Treble clef: E4=120, F4=110, G4=100, A4=90, B4=80, C5=70, D5=60, E5=50, F5=40
        
        // Direct mapping for common notes in C4-C6 range
        // Treble clef: E4=120(bottom line), F4=110, G4=100, A4=90, B4=80, C5=70, D5=60, E5=50, F5=40(top line)
        const noteMap = {
            'C4': 140, 'D4': 130, 'E4': 120, 'F4': 110, 'G4': 100, 'A4': 90, 'B4': 80,
            'C5': 70, 'D5': 60, 'E5': 50, 'F5': 40, 'G5': 30, 'A5': 20, 'B5': 10,
            'C6': 0
        };
        
        // Handle sharps - use same position as natural note
        const naturalNote = noteName.replace('#', '');
        const noteKey = `${naturalNote}${octave}`;
        
        if (noteMap[noteKey] !== undefined) {
            return noteMap[noteKey];
        }
        
        // Fallback calculation
        const noteOrder = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        const noteIndex = noteOrder.indexOf(naturalNote);
        const octaveOffset = (octave - 4) * 70; // Approximate 70px per octave
        const noteOffset = noteIndex * 10; // Approximate 10px per note
        return 130 - octaveOffset - noteOffset;
    }

    getClefForNote(octave) {
        // Use treble clef for C4 and above, bass clef for below C4
        // For our keyboard range (C4-C6), we'll use treble clef
        if (octave >= 4) {
            return 'treble';
        } else {
            return 'bass';
        }
    }

    drawNote(x, y, noteName, octave, isSharp) {
        const noteGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        noteGroup.classList.add('music-note');

        // Draw note head (circle) - scaled for smaller square
        const noteHead = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        noteHead.setAttribute('cx', x);
        noteHead.setAttribute('cy', y);
        noteHead.setAttribute('rx', '6');
        noteHead.setAttribute('ry', '4');
        noteHead.setAttribute('fill', '#000');
        noteGroup.appendChild(noteHead);

        // Draw stem (if note is on or above middle line, stem goes down)
        const stemDirection = y <= 80 ? 1 : -1; // 1 = down, -1 = up
        const stemLength = 25;
        const stem = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        stem.setAttribute('x1', x + 6);
        stem.setAttribute('y1', y);
        stem.setAttribute('x2', x + 6);
        stem.setAttribute('y2', y + (stemLength * stemDirection));
        stem.setAttribute('stroke', '#000');
        stem.setAttribute('stroke-width', '1.5');
        noteGroup.appendChild(stem);

        // Draw sharp symbol if needed
        if (isSharp) {
            const sharp = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            sharp.setAttribute('x', x - 12);
            sharp.setAttribute('y', y + 3);
            sharp.setAttribute('font-family', 'Arial');
            sharp.setAttribute('font-size', '12');
            sharp.setAttribute('fill', '#000');
            sharp.setAttribute('font-weight', 'bold');
            sharp.textContent = '♯';
            noteGroup.appendChild(sharp);
        }

        // Draw ledger lines if note is outside staff (staff lines at 40, 60, 80, 100, 120)
        // Notes above top line (40) or below bottom line (120) need ledger lines
        if (y < 40) {
            // Above staff - draw ledger lines every 20px (matching staff line spacing)
            let ledgerY = 40;
            while (ledgerY >= y - 5) {
                this.drawLedgerLine(x, ledgerY, noteGroup);
                ledgerY -= 20;
            }
        } else if (y > 120) {
            // Below staff - draw ledger lines every 20px
            let ledgerY = 120;
            while (ledgerY <= y + 5) {
                this.drawLedgerLine(x, ledgerY, noteGroup);
                ledgerY += 20;
            }
        }

        this.svg.appendChild(noteGroup);
    }

    drawLedgerLine(x, y, noteGroup) {
        // Draw ledger line for notes outside the staff
        // Ledger lines should extend a bit beyond the note head
        const ledgerLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        ledgerLine.classList.add('ledger-line');
        
        // Ledger line extends about 12px on each side of the note
        ledgerLine.setAttribute('x1', x - 12);
        ledgerLine.setAttribute('y1', y);
        ledgerLine.setAttribute('x2', x + 12);
        ledgerLine.setAttribute('y2', y);
        ledgerLine.setAttribute('stroke', '#000');
        ledgerLine.setAttribute('stroke-width', '1.5');
        noteGroup.appendChild(ledgerLine);
    }

    shiftNotes() {
        // Remove first note and shift all others left
        if (this.playedNotes.length === 0) return;

        // Remove first note element
        const firstNote = this.svg.querySelector('.music-note');
        if (firstNote) {
            firstNote.remove();
        }

        // Remove first from array
        this.playedNotes.shift();

        // Shift remaining notes left
        this.playedNotes.forEach((noteData, index) => {
            noteData.x -= this.noteSpacing;
            const noteElement = this.svg.querySelectorAll('.music-note')[index];
            if (noteElement) {
                noteElement.setAttribute('transform', `translate(${-this.noteSpacing}, 0)`);
            }
        });

        // Reset position
        this.notePosition -= this.noteSpacing;
    }

    clear() {
        this.clearNotes();
    }
}

