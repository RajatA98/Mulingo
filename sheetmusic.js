// Sheet Music Display

class SheetMusic {
    constructor() {
        this.svg = null;
        this.notePosition = 100; // Starting x position for notes
        this.noteSpacing = 40; // Space between notes
        this.maxNotes = 15; // Maximum notes to show before scrolling
        this.playedNotes = []; // Array of {note, x, y, duration}
        this.preferFlats = false; // User preference for displaying flats vs sharps
        this.currentOctaveShift = 0; // Track if we're showing 8va or 8vb
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
            // Remove by groups to ensure all related elements are removed
            const noteGroups = this.svg.querySelectorAll('.music-note');
            noteGroups.forEach(group => group.remove());
            // Also remove any orphaned elements
            const orphaned = this.svg.querySelectorAll('.ledger-line, .octave-notation');
            orphaned.forEach(el => el.remove());
        }
        this.playedNotes = [];
        this.notePosition = 100;
        this.currentOctaveShift = 0;
    }

    setFlatPreference(preferFlats) {
        this.preferFlats = preferFlats;
        // Redraw current note with new preference if there is one
        if (this.playedNotes.length > 0) {
            const currentNote = this.playedNotes[0].note;
            this.addNote(currentNote);
        }
    }

    convertToFlat(note) {
        // Convert sharp notes to their flat equivalents
        const sharpToFlat = {
            'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb'
        };
        
        const match = note.match(/([A-G]#?)(\d)/);
        if (!match) return note;
        
        const [, noteName, octave] = match;
        if (sharpToFlat[noteName]) {
            return sharpToFlat[noteName] + octave;
        }
        return note;
    }

    convertToSharp(note) {
        // Convert flat notes to their sharp equivalents
        const flatToSharp = {
            'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
        };
        
        const match = note.match(/([A-G]b?)(\d)/);
        if (!match) return note;
        
        const [, noteName, octave] = match;
        if (flatToSharp[noteName]) {
            return flatToSharp[noteName] + octave;
        }
        return note;
    }

    getDisplayNote(note) {
        // Return the note in the preferred format (sharp or flat)
        if (this.preferFlats) {
            return this.convertToFlat(note);
        } else {
            return this.convertToSharp(note);
        }
    }

    addNote(note) {
        // Make sure SVG is available
        if (!this.svg) {
            this.setupSVG();
            if (!this.svg) return;
        }

        // Clear previous note - show only one note at a time
        // Force immediate clearing before drawing
        if (this.svg) {
            const existingNotes = this.svg.querySelectorAll('.music-note, .ledger-line, .octave-notation');
            existingNotes.forEach(el => {
                try {
                    el.remove();
                } catch (e) {
                    // Ignore if already removed
                }
            });
        }
        this.playedNotes = [];
        this.currentOctaveShift = 0;

        // Convert to preferred format (sharp or flat)
        const displayNote = this.getDisplayNote(note);

        // Parse note (e.g., "C4", "C#4", "Db4", "D4")
        const parsed = this.parseNote(displayNote);
        if (!parsed) {
            console.log('Could not parse note:', note);
            return;
        }

        let { noteName, octave, isSharp, isFlat, accidental } = parsed;
        
        // Determine if we need octave transposition (8va/8vb)
        // Use 8va/8vb when notes would have more than 2 ledger lines
        let octaveShift = 0;
        let clef = this.getClefForNote(octave, noteName);
        
        if (clef === 'treble') {
            // Treble clef staff range: E4 (bottom line) to F5 (top line)
            // Allow max 2 ledger lines: down to C4, up to A5
            // Beyond that, use 8va/8vb
            if (octave >= 6) {
                // Notes C6 and above: use 8va (display octave lower)
                octaveShift = -1;
            } else if (octave <= 3) {
                // Notes B3 and below: switch to bass clef
                clef = 'bass';
                octaveShift = 0;
            }
        }
        
        if (clef === 'bass') {
            // Bass clef staff range: G2 (bottom line) to A3 (top line)
            // Allow max 2 ledger lines: down to E2, up to C4
            // Beyond that, use 8va/8vb
            if (octave <= 1) {
                // Notes B1 and below: use 8vb (display octave higher)
                octaveShift = 1;
            } else if (octave >= 4) {
                // Notes C4 and above: switch to treble clef
                clef = 'treble';
                octaveShift = 0;
            }
        }
        
        // Apply octave shift for display
        const displayOctave = octave + octaveShift;
        this.currentOctaveShift = octaveShift;
        
        this.updateClef(clef);
        
        // Calculate y position on staff (using display octave)
        const yPosition = this.getNoteYPosition(noteName, displayOctave);
        
        // Add note to array (only one note now)
        this.playedNotes = [{
            note: displayNote,
            x: 110, // Center position for centered staff
            y: yPosition,
            noteName: noteName,
            octave: octave,
            displayOctave: displayOctave,
            isSharp: isSharp,
            isFlat: isFlat,
            accidental: accidental,
            octaveShift: octaveShift
        }];

        // Draw the note (centered on staff)
        const centerX = 110; // Center of the centered staff
        this.drawNote(centerX, yPosition, noteName, displayOctave, accidental, octaveShift, '#000');
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
        clefElement.setAttribute('font-size', '52');
        clefElement.setAttribute('fill', '#000');
        clefElement.setAttribute('font-weight', 'bold');
        
        if (clef === 'treble') {
            // Treble clef - use a music symbol (centered on new staff)
            clefElement.setAttribute('x', '15');
            clefElement.setAttribute('y', '98');
            clefElement.textContent = '𝄞'; // Treble clef symbol
        } else {
            // Bass clef - draw two dots and a symbol (centered on new staff)
            clefElement.setAttribute('x', '15');
            clefElement.setAttribute('y', '95');
            clefElement.textContent = '𝄢'; // Bass clef symbol
            // Add two dots for bass clef
            const dot1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            dot1.setAttribute('cx', '45');
            dot1.setAttribute('cy', '80');
            dot1.setAttribute('r', '2');
            dot1.setAttribute('fill', '#000');
            dot1.classList.add('clef');
            this.svg.appendChild(dot1);
            
            const dot2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            dot2.setAttribute('cx', '45');
            dot2.setAttribute('cy', '90');
            dot2.setAttribute('r', '2');
            dot2.setAttribute('fill', '#000');
            dot2.classList.add('clef');
            this.svg.appendChild(dot2);
        }
        
        this.svg.appendChild(clefElement);
    }

    parseNote(note) {
        // Parse note like "C4", "C#4", "Db4", "D4", etc.
        const match = note.match(/([A-G])([#b])?(\d)/);
        if (!match) return null;

        const noteName = match[1];
        const accidental = match[2];
        const isSharp = accidental === '#';
        const isFlat = accidental === 'b';
        const octave = parseInt(match[3]);

        return { noteName, octave, isSharp, isFlat, accidental: accidental || '' };
    }

    getNoteYPosition(noteName, octave) {
        // NEW Staff line positions: 60 (top line), 70, 80 (middle line), 90, 100 (bottom line)
        // Each space/line is 5px apart (tighter spacing for centered display)
        
        // Handle sharps and flats - use same position as natural note
        const naturalNote = noteName.replace(/[#b]/g, '');
        
        // Determine if we're using bass or treble clef
        const clef = this.getClefForNote(octave, naturalNote);
        
        if (clef === 'treble') {
            // Treble clef mapping - centered on staff
            // Staff lines (top to bottom): F5=60, D5=70, B4=80, G4=90, E4=100
            // Spaces: E5=65, C5=75, A4=85, F4=95
            // Ledger lines: below staff at 110, 120; above staff at 50, 40
            const trebleMap = {
                'C4': 110, 'D4': 105, 'E4': 100, 'F4': 95, 'G4': 90, 'A4': 85, 'B4': 80,
                'C5': 75, 'D5': 70, 'E5': 65, 'F5': 60, 'G5': 55, 'A5': 50, 'B5': 45,
                'C6': 40, 'D6': 35, 'E6': 30, 'F6': 25, 'G6': 20, 'A6': 15, 'B6': 10,
                'C7': 5, 'D7': 0, 'E7': -5, 'F7': -10, 'G7': -15, 'A7': -20, 'B7': -25,
                'C8': -30
            };
            
            const noteKey = `${naturalNote}${octave}`;
            if (trebleMap[noteKey] !== undefined) {
                return trebleMap[noteKey];
            }
        } else {
            // Bass clef mapping - centered on staff
            // Staff lines (top to bottom): A3=60, F3=70, D3=80, B2=90, G2=100
            // Spaces: G3=65, E3=75, C3=85, A2=95
            // Ledger lines: below staff at 110, 120; above staff at 50, 40
            const bassMap = {
                'A0': 150, 'B0': 145,
                'C1': 140, 'D1': 135, 'E1': 130, 'F1': 125, 'G1': 120, 'A1': 115, 'B1': 110,
                'C2': 120, 'D2': 115, 'E2': 110, 'F2': 105, 'G2': 100, 'A2': 95, 'B2': 90,
                'C3': 85, 'D3': 80, 'E3': 75, 'F3': 70, 'G3': 65, 'A3': 60, 'B3': 55,
                'C4': 50
            };
            
            const noteKey = `${naturalNote}${octave}`;
            if (bassMap[noteKey] !== undefined) {
                return bassMap[noteKey];
            }
        }
        
        // Fallback calculation
        const noteOrder = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        const noteIndex = noteOrder.indexOf(naturalNote);
        const octaveOffset = (octave - 4) * 35;
        const noteOffset = noteIndex * 5;
        return 105 - octaveOffset - noteOffset;
    }

    getClefForNote(octave, noteName) {
        // Use bass clef for notes below C4, treble clef for C4 and above
        // Middle C (C4) and above use treble clef
        if (octave < 3) {
            return 'bass';
        } else if (octave === 3) {
            // For octave 3, use bass clef
            return 'bass';
        } else {
            return 'treble';
        }
    }

    drawNote(x, y, noteName, octave, accidental, octaveShift = 0, color = '#000') {
        const noteGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        noteGroup.classList.add('music-note');
        if (color !== '#000') {
            noteGroup.classList.add('colored-note');
            noteGroup.setAttribute('data-note-color', color);
        }

        // Draw note head (filled ellipse for quarter note) - solid unbroken shape
        const noteHead = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        noteHead.setAttribute('cx', x);
        noteHead.setAttribute('cy', y);
        noteHead.setAttribute('rx', '5.5');
        noteHead.setAttribute('ry', '4.5');
        noteHead.setAttribute('fill', color);
        noteHead.setAttribute('stroke', 'none');
        noteHead.setAttribute('shape-rendering', 'geometricPrecision');
        noteHead.setAttribute('vector-effect', 'non-scaling-stroke');
        noteGroup.appendChild(noteHead);

        // Draw stem (if note is on or above middle line, stem goes down)
        const stemDirection = y <= 80 ? 1 : -1; // 1 = down, -1 = up (middle line at 80)
        const stemLength = 30;
        const stemX = stemDirection === 1 ? x + 5 : x - 5; // Stem on right if down, left if up
        const stem = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        stem.setAttribute('x1', stemX);
        stem.setAttribute('y1', y);
        stem.setAttribute('x2', stemX);
        stem.setAttribute('y2', y + (stemLength * stemDirection));
        stem.setAttribute('stroke', color);
        stem.setAttribute('stroke-width', '1.2');
        noteGroup.appendChild(stem);

        // Draw accidental symbol if needed (sharp or flat)
        if (accidental === '#') {
            const sharp = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            sharp.setAttribute('x', x - 14);
            sharp.setAttribute('y', y + 4);
            sharp.setAttribute('font-family', 'serif');
            sharp.setAttribute('font-size', '16');
            sharp.setAttribute('fill', color);
            sharp.setAttribute('font-weight', 'bold');
            sharp.textContent = '♯';
            noteGroup.appendChild(sharp);
        } else if (accidental === 'b') {
            const flat = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            flat.setAttribute('x', x - 19);
            flat.setAttribute('y', y + 5);
            flat.setAttribute('font-family', 'serif');
            flat.setAttribute('font-size', '18');
            flat.setAttribute('fill', color);
            flat.setAttribute('font-weight', 'bold');
            flat.textContent = '♭';
            noteGroup.appendChild(flat);
        }

        // Draw ledger lines if note is outside staff (NEW staff lines at 60, 70, 80, 90, 100)
        // Staff lines are 10px apart, so ledger lines should be too
        // Max 2 ledger lines before switching to 8va/8vb
        if (y < 60) {
            // Above staff - draw ledger lines every 10px (matching staff line spacing)
            let ledgerY = 50;
            let lineCount = 0;
            while (ledgerY >= y - 3 && lineCount < 2) {
                this.drawLedgerLine(x, ledgerY, noteGroup, color);
                ledgerY -= 10;
                lineCount++;
            }
        } else if (y > 100) {
            // Below staff - draw ledger lines every 10px (matching staff line spacing)
            let ledgerY = 110;
            let lineCount = 0;
            while (ledgerY <= y + 3 && lineCount < 2) {
                this.drawLedgerLine(x, ledgerY, noteGroup, color);
                ledgerY += 10;
                lineCount++;
            }
        }

        this.svg.appendChild(noteGroup);

        // Draw 8va or 8vb notation if needed
        if (octaveShift !== 0) {
            this.drawOctaveNotation(x, y, octaveShift);
        }
    }

    drawOctaveNotation(x, y, octaveShift) {
        // Draw 8va (octave higher) or 8vb (octave lower) notation
        const notationGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        notationGroup.classList.add('octave-notation');

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        
        if (octaveShift === -1) {
            // 8va - note sounds an octave higher than written
            text.setAttribute('x', x - 8);
            text.setAttribute('y', '35');
            text.textContent = '8va';
        } else if (octaveShift === 1) {
            // 8vb - note sounds an octave lower than written
            text.setAttribute('x', x - 8);
            text.setAttribute('y', '130');
            text.textContent = '8vb';
        }

        text.setAttribute('font-family', 'serif');
        text.setAttribute('font-size', '11');
        text.setAttribute('font-style', 'italic');
        text.setAttribute('fill', '#000');
        text.setAttribute('font-weight', 'bold');
        
        notationGroup.appendChild(text);

        // Draw dotted line extending from the notation
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        if (octaveShift === -1) {
            line.setAttribute('x1', x + 10);
            line.setAttribute('y1', '38');
            line.setAttribute('x2', x + 40);
            line.setAttribute('y2', '38');
        } else {
            line.setAttribute('x1', x + 10);
            line.setAttribute('y1', '125');
            line.setAttribute('x2', x + 40);
            line.setAttribute('y2', '125');
        }
        line.setAttribute('stroke', '#000');
        line.setAttribute('stroke-width', '1');
        line.setAttribute('stroke-dasharray', '2,2');
        
        notationGroup.appendChild(line);
        this.svg.appendChild(notationGroup);
    }

    drawLedgerLine(x, y, noteGroup, color = '#000') {
        // Draw ledger line for notes outside the staff
        // Ledger lines should extend a bit beyond the note head
        const ledgerLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        ledgerLine.classList.add('ledger-line');
        
        // Ledger line extends about 12px on each side of the note
        ledgerLine.setAttribute('x1', x - 12);
        ledgerLine.setAttribute('y1', y);
        ledgerLine.setAttribute('x2', x + 12);
        ledgerLine.setAttribute('y2', y);
        ledgerLine.setAttribute('stroke', color);
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

// Scrolling Sheet Music Display for Songs/Melodies
class ScrollingSheetMusic {
    constructor() {
        this.svg = null;
        this.notePosition = 80; // Starting x position for notes
        this.noteSpacing = 35; // Space between notes
        this.playedNotes = []; // Array of {note, x, y, noteName, octave, accidental, octaveShift}
        this.noteElements = new Map(); // Map of note index to SVG element for highlighting
        this.preferFlats = false;
        this.currentClef = 'treble';
        this.melodyNotes = []; // Store the full melody for sight reading
        this.currentNoteIndex = 0; // Track which note we're on
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupSVG());
        } else {
            this.setupSVG();
        }
    }

    setupSVG() {
        this.svg = document.getElementById('song-staff-svg');
        if (!this.svg) {
            console.error('Song staff SVG not found');
            return;
        }
        // Set initial viewBox
        this.svg.setAttribute('viewBox', '0 0 800 180');
        this.drawStaffLines();
        this.updateClef('treble');
    }

    drawStaffLines() {
        if (!this.svg) return;
        
        const staffLinesGroup = this.svg.getElementById('staff-lines');
        if (!staffLinesGroup) return;
        
        // Get current viewBox width
        const viewBox = this.svg.getAttribute('viewBox');
        const width = viewBox ? parseFloat(viewBox.split(' ')[2]) : 800;
        
        // Clear existing lines
        staffLinesGroup.innerHTML = '';
        
        // Draw staff lines across the full width
        for (let i = 0; i < 5; i++) {
            const y = 40 + (i * 10); // Staff lines at y: 40, 50, 60, 70, 80
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', '0');
            line.setAttribute('y1', y);
            line.setAttribute('x2', width);
            line.setAttribute('y2', y);
            line.setAttribute('stroke', '#333');
            line.setAttribute('stroke-width', '1.5');
            staffLinesGroup.appendChild(line);
        }
    }

    setFlatPreference(preferFlats) {
        this.preferFlats = preferFlats;
    }

    getDisplayNote(note) {
        if (this.preferFlats) {
            return this.convertToFlat(note);
        } else {
            return this.convertToSharp(note);
        }
    }

    convertToFlat(note) {
        const sharpToFlat = {
            'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb'
        };
        const match = note.match(/([A-G]#?)(\d)/);
        if (!match) return note;
        const [, noteName, octave] = match;
        if (sharpToFlat[noteName]) {
            return sharpToFlat[noteName] + octave;
        }
        return note;
    }

    convertToSharp(note) {
        const flatToSharp = {
            'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
        };
        const match = note.match(/([A-G]b?)(\d)/);
        if (!match) return note;
        const [, noteName, octave] = match;
        if (flatToSharp[noteName]) {
            return flatToSharp[noteName] + octave;
        }
        return note;
    }

    parseNote(note) {
        const match = note.match(/([A-G])([#b])?(\d)/);
        if (!match) return null;
        const noteName = match[1];
        const accidental = match[2] || '';
        const isSharp = accidental === '#';
        const isFlat = accidental === 'b';
        const octave = parseInt(match[3]);
        return { noteName, octave, isSharp, isFlat, accidental };
    }

    getNoteYPosition(noteName, octave) {
        const naturalNote = noteName.replace(/[#b]/g, '');
        const clef = this.getClefForNote(octave, naturalNote);
        
        if (clef === 'treble') {
            const trebleMap = {
                'C4': 90, 'D4': 85, 'E4': 80, 'F4': 75, 'G4': 70, 'A4': 65, 'B4': 60,
                'C5': 55, 'D5': 50, 'E5': 45, 'F5': 40, 'G5': 35, 'A5': 30, 'B5': 25,
                'C6': 20, 'D6': 15, 'E6': 10, 'F6': 5, 'G6': 0, 'A6': -5, 'B6': -10,
                'C7': -15, 'D7': -20, 'E7': -25, 'F7': -30, 'G7': -35, 'A7': -40, 'B7': -45,
                'C8': -50
            };
            const noteKey = `${naturalNote}${octave}`;
            if (trebleMap[noteKey] !== undefined) {
                return trebleMap[noteKey];
            }
        } else {
            const bassMap = {
                'A0': 130, 'B0': 125,
                'C1': 120, 'D1': 115, 'E1': 110, 'F1': 105, 'G1': 100, 'A1': 95, 'B1': 90,
                'C2': 100, 'D2': 95, 'E2': 90, 'F2': 85, 'G2': 80, 'A2': 75, 'B2': 70,
                'C3': 65, 'D3': 60, 'E3': 55, 'F3': 50, 'G3': 45, 'A3': 40, 'B3': 35,
                'C4': 30
            };
            const noteKey = `${naturalNote}${octave}`;
            if (bassMap[noteKey] !== undefined) {
                return bassMap[noteKey];
            }
        }
        
        // Fallback
        const noteOrder = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        const noteIndex = noteOrder.indexOf(naturalNote);
        const octaveOffset = (octave - 4) * 35;
        const noteOffset = noteIndex * 5;
        return 75 - octaveOffset - noteOffset;
    }

    getClefForNote(octave, noteName) {
        if (octave < 3) {
            return 'bass';
        } else if (octave === 3) {
            return 'bass';
        } else {
            return 'treble';
        }
    }

    updateClef(clef) {
        if (!this.svg) return;
        this.currentClef = clef;
        
        // Remove all existing clef elements (text and dots)
        const existingClefs = this.svg.querySelectorAll('.clef');
        existingClefs.forEach(el => el.remove());

        const clefElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        clefElement.classList.add('clef');
        clefElement.setAttribute('font-family', 'serif');
        clefElement.setAttribute('font-size', '52');
        clefElement.setAttribute('fill', '#000');
        clefElement.setAttribute('font-weight', 'bold');
        
        if (clef === 'treble') {
            clefElement.setAttribute('x', '10');
            clefElement.setAttribute('y', '78');
            clefElement.textContent = '𝄞';
        } else {
            clefElement.setAttribute('x', '10');
            clefElement.setAttribute('y', '75');
            clefElement.textContent = '𝄢';
            const dot1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            dot1.setAttribute('cx', '40');
            dot1.setAttribute('cy', '60');
            dot1.setAttribute('r', '2');
            dot1.setAttribute('fill', '#000');
            dot1.classList.add('clef');
            this.svg.appendChild(dot1);
            
            const dot2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            dot2.setAttribute('cx', '40');
            dot2.setAttribute('cy', '70');
            dot2.setAttribute('r', '2');
            dot2.setAttribute('fill', '#000');
            dot2.classList.add('clef');
            this.svg.appendChild(dot2);
        }
        
        this.svg.appendChild(clefElement);
    }

    addNote(note, color = '#000') {
        if (!this.svg) {
            this.setupSVG();
            if (!this.svg) return;
        }

        const displayNote = this.getDisplayNote(note);
        const parsed = this.parseNote(displayNote);
        if (!parsed) return;

        let { noteName, octave, isSharp, isFlat, accidental } = parsed;
        
        // Determine clef and octave shift
        let octaveShift = 0;
        let clef = this.getClefForNote(octave, noteName);
        
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
        
        // Update clef if changed
        if (clef !== this.currentClef) {
            this.updateClef(clef);
        }
        
        const yPosition = this.getNoteYPosition(noteName, displayOctave);
        
        // Add note to array
        const noteData = {
            note: displayNote,
            x: this.notePosition,
            y: yPosition,
            noteName: noteName,
            octave: octave,
            displayOctave: displayOctave,
            isSharp: isSharp,
            isFlat: isFlat,
            accidental: accidental,
            octaveShift: octaveShift,
            color: color
        };
        
        this.playedNotes.push(noteData);
        
        // Expand SVG viewBox if needed
        const requiredWidth = this.notePosition + 50; // Add some padding
        const currentViewBox = this.svg.getAttribute('viewBox');
        if (currentViewBox) {
            const [, , currentWidth] = currentViewBox.split(' ').map(Number);
            if (requiredWidth > currentWidth) {
                this.svg.setAttribute('viewBox', `0 0 ${requiredWidth} 180`);
                // Redraw staff lines for new width
                this.drawStaffLines();
            }
        }
        
        // Draw the note
        this.drawNote(this.notePosition, yPosition, noteName, displayOctave, accidental, octaveShift, color);
        
        // Move position for next note
        this.notePosition += this.noteSpacing;
        
        // Scroll to show new note
        this.scrollToNote();
    }

    drawNote(x, y, noteName, octave, accidental, octaveShift = 0, color = '#000') {
        const notesGroup = this.svg.getElementById('song-notes');
        if (!notesGroup) return;
        
        const noteGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        noteGroup.classList.add('music-note');
        if (color !== '#000') {
            noteGroup.classList.add('colored-note');
        }

        // Draw note head
        const noteHead = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        noteHead.setAttribute('cx', x);
        noteHead.setAttribute('cy', y);
        noteHead.setAttribute('rx', '5.5');
        noteHead.setAttribute('ry', '4.5');
        noteHead.setAttribute('fill', color);
        noteHead.setAttribute('stroke', 'none');
        noteHead.setAttribute('shape-rendering', 'geometricPrecision');
        noteGroup.appendChild(noteHead);

        // Draw stem
        const stemDirection = y <= 60 ? 1 : -1;
        const stemLength = 30;
        const stemX = stemDirection === 1 ? x + 5 : x - 5;
        const stem = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        stem.setAttribute('x1', stemX);
        stem.setAttribute('y1', y);
        stem.setAttribute('x2', stemX);
        stem.setAttribute('y2', y + (stemLength * stemDirection));
        stem.setAttribute('stroke', color);
        stem.setAttribute('stroke-width', '1.2');
        noteGroup.appendChild(stem);

        // Draw accidental
        if (accidental === '#') {
            const sharp = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            sharp.setAttribute('x', x - 14);
            sharp.setAttribute('y', y + 4);
            sharp.setAttribute('font-family', 'serif');
            sharp.setAttribute('font-size', '16');
            sharp.setAttribute('fill', color);
            sharp.setAttribute('font-weight', 'bold');
            sharp.textContent = '♯';
            noteGroup.appendChild(sharp);
        } else if (accidental === 'b') {
            const flat = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            flat.setAttribute('x', x - 19);
            flat.setAttribute('y', y + 5);
            flat.setAttribute('font-family', 'serif');
            flat.setAttribute('font-size', '18');
            flat.setAttribute('fill', color);
            flat.setAttribute('font-weight', 'bold');
            flat.textContent = '♭';
            noteGroup.appendChild(flat);
        }

        // Draw ledger lines
        if (y < 40) {
            let ledgerY = 30;
            let lineCount = 0;
            while (ledgerY >= y - 3 && lineCount < 2) {
                this.drawLedgerLine(x, ledgerY, noteGroup, color);
                ledgerY -= 10;
                lineCount++;
            }
        } else if (y > 80) {
            let ledgerY = 90;
            let lineCount = 0;
            while (ledgerY <= y + 3 && lineCount < 2) {
                this.drawLedgerLine(x, ledgerY, noteGroup, color);
                ledgerY += 10;
                lineCount++;
            }
        }

        notesGroup.appendChild(noteGroup);
    }

    drawLedgerLine(x, y, noteGroup, color = '#000') {
        const ledgerLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        ledgerLine.classList.add('ledger-line');
        ledgerLine.setAttribute('x1', x - 12);
        ledgerLine.setAttribute('y1', y);
        ledgerLine.setAttribute('x2', x + 12);
        ledgerLine.setAttribute('y2', y);
        ledgerLine.setAttribute('stroke', color);
        ledgerLine.setAttribute('stroke-width', '1.5');
        noteGroup.appendChild(ledgerLine);
    }

    scrollToNote() {
        const container = document.querySelector('.song-sheet-music-container');
        if (container) {
            // Scroll to show the latest note
            container.scrollLeft = container.scrollWidth - container.clientWidth;
        }
    }

    clear() {
        if (!this.svg) return;
        const notesGroup = this.svg.getElementById('song-notes');
        if (notesGroup) {
            notesGroup.innerHTML = '';
        }
        this.playedNotes = [];
        this.notePosition = 80;
        this.currentClef = 'treble';
        // Reset viewBox to initial size
        this.svg.setAttribute('viewBox', '0 0 800 180');
        this.drawStaffLines();
        this.updateClef('treble');
    }

    loadMelody(notes) {
        // Pre-load all notes for sight reading - show them all at once
        this.clear();
        this.melodyNotes = notes;
        this.currentNoteIndex = 0;
        
        // Calculate required width
        const requiredWidth = 80 + (notes.length * this.noteSpacing) + 50;
        this.svg.setAttribute('viewBox', `0 0 ${requiredWidth} 180`);
        this.drawStaffLines();
        
        // Draw all notes in gray (unplayed state)
        notes.forEach((note, index) => {
            this.addNoteForSightReading(note, index, '#888'); // Gray for unplayed notes
        });
    }

    addNoteForSightReading(note, index, color = '#888') {
        if (!this.svg) return;

        const displayNote = this.getDisplayNote(note);
        const parsed = this.parseNote(displayNote);
        if (!parsed) return;

        let { noteName, octave, isSharp, isFlat, accidental } = parsed;
        
        // Determine clef and octave shift
        let octaveShift = 0;
        let clef = this.getClefForNote(octave, noteName);
        
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
        
        // Update clef if changed (only for first note)
        if (index === 0 && clef !== this.currentClef) {
            this.updateClef(clef);
        }
        
        const yPosition = this.getNoteYPosition(noteName, displayOctave);
        const xPosition = 80 + (index * this.noteSpacing);
        
        // Store note data
        const noteData = {
            note: displayNote,
            x: xPosition,
            y: yPosition,
            noteName: noteName,
            octave: octave,
            displayOctave: displayOctave,
            isSharp: isSharp,
            isFlat: isFlat,
            accidental: accidental,
            octaveShift: octaveShift,
            color: color,
            index: index
        };
        
        this.playedNotes.push(noteData);
        
        // Draw the note with an ID for highlighting
        const noteElement = this.drawNoteWithId(xPosition, yPosition, noteName, displayOctave, accidental, octaveShift, color, index);
        this.noteElements.set(index, noteElement);
    }

    highlightNote(index, isCorrect) {
        // Highlight a note as correct (green) or incorrect (red)
        const noteElement = this.noteElements.get(index);
        if (!noteElement) return;
        
        const color = isCorrect ? '#10b981' : '#ef4444';
        
        // Update all parts of the note (head, stem, accidental, ledger lines)
        const noteHead = noteElement.querySelector('ellipse');
        if (noteHead) noteHead.setAttribute('fill', color);
        
        const stem = noteElement.querySelector('line');
        if (stem) stem.setAttribute('stroke', color);
        
        const accidental = noteElement.querySelector('text');
        if (accidental) accidental.setAttribute('fill', color);
        
        const ledgerLines = noteElement.querySelectorAll('.ledger-line');
        ledgerLines.forEach(line => line.setAttribute('stroke', color));
        
        // Update stored color
        if (this.playedNotes[index]) {
            this.playedNotes[index].color = color;
        }
        
        // For incorrect notes, reset to gray after a delay (so user can see what they should play)
        if (!isCorrect) {
            setTimeout(() => {
                this.resetNoteColor(index);
            }, 1000);
        }
    }

    resetNoteColor(index) {
        // Reset note to gray (unplayed state)
        const noteElement = this.noteElements.get(index);
        if (!noteElement) return;
        
        const color = '#888';
        
        const noteHead = noteElement.querySelector('ellipse');
        if (noteHead) noteHead.setAttribute('fill', color);
        
        const stem = noteElement.querySelector('line');
        if (stem) stem.setAttribute('stroke', color);
        
        const accidental = noteElement.querySelector('text');
        if (accidental) accidental.setAttribute('fill', color);
        
        const ledgerLines = noteElement.querySelectorAll('.ledger-line');
        ledgerLines.forEach(line => line.setAttribute('stroke', color));
        
        if (this.playedNotes[index]) {
            this.playedNotes[index].color = color;
        }
    }

    drawNoteWithId(x, y, noteName, octave, accidental, octaveShift = 0, color = '#888', noteId) {
        const notesGroup = this.svg.getElementById('song-notes');
        if (!notesGroup) return null;
        
        const noteGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        noteGroup.classList.add('music-note');
        noteGroup.setAttribute('data-note-index', noteId);
        if (color !== '#888' && color !== '#000') {
            noteGroup.classList.add('colored-note');
        }

        // Draw note head
        const noteHead = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        noteHead.setAttribute('cx', x);
        noteHead.setAttribute('cy', y);
        noteHead.setAttribute('rx', '5.5');
        noteHead.setAttribute('ry', '4.5');
        noteHead.setAttribute('fill', color);
        noteHead.setAttribute('stroke', 'none');
        noteHead.setAttribute('shape-rendering', 'geometricPrecision');
        noteGroup.appendChild(noteHead);

        // Draw stem
        const stemDirection = y <= 60 ? 1 : -1;
        const stemLength = 30;
        const stemX = stemDirection === 1 ? x + 5 : x - 5;
        const stem = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        stem.setAttribute('x1', stemX);
        stem.setAttribute('y1', y);
        stem.setAttribute('x2', stemX);
        stem.setAttribute('y2', y + (stemLength * stemDirection));
        stem.setAttribute('stroke', color);
        stem.setAttribute('stroke-width', '1.2');
        noteGroup.appendChild(stem);

        // Draw accidental
        if (accidental === '#') {
            const sharp = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            sharp.setAttribute('x', x - 14);
            sharp.setAttribute('y', y + 4);
            sharp.setAttribute('font-family', 'serif');
            sharp.setAttribute('font-size', '16');
            sharp.setAttribute('fill', color);
            sharp.setAttribute('font-weight', 'bold');
            sharp.textContent = '♯';
            noteGroup.appendChild(sharp);
        } else if (accidental === 'b') {
            const flat = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            flat.setAttribute('x', x - 19);
            flat.setAttribute('y', y + 5);
            flat.setAttribute('font-family', 'serif');
            flat.setAttribute('font-size', '18');
            flat.setAttribute('fill', color);
            flat.setAttribute('font-weight', 'bold');
            flat.textContent = '♭';
            noteGroup.appendChild(flat);
        }

        // Draw ledger lines
        if (y < 40) {
            let ledgerY = 30;
            let lineCount = 0;
            while (ledgerY >= y - 3 && lineCount < 2) {
                this.drawLedgerLine(x, ledgerY, noteGroup, color);
                ledgerY -= 10;
                lineCount++;
            }
        } else if (y > 80) {
            let ledgerY = 90;
            let lineCount = 0;
            while (ledgerY <= y + 3 && lineCount < 2) {
                this.drawLedgerLine(x, ledgerY, noteGroup, color);
                ledgerY += 10;
                lineCount++;
            }
        }

        notesGroup.appendChild(noteGroup);
        return noteGroup;
    }

    clear() {
        if (!this.svg) return;
        const notesGroup = this.svg.getElementById('song-notes');
        if (notesGroup) {
            notesGroup.innerHTML = '';
        }
        this.playedNotes = [];
        this.noteElements.clear();
        this.melodyNotes = [];
        this.currentNoteIndex = 0;
        this.notePosition = 80;
        this.currentClef = 'treble';
        // Reset viewBox to initial size
        this.svg.setAttribute('viewBox', '0 0 800 180');
        this.drawStaffLines();
        this.updateClef('treble');
    }
}

