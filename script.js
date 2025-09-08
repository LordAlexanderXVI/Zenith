document.addEventListener('DOMContentLoaded', () => {
    // --- Global Variables ---
    let highestZ = 2; // Start z-index above the notes-container
    const HEX_TO_RGB = { '#ffc': '255,255,204', '#cfc': '204,255,204', '#ccf': '204,204,255', '#fcc': '255,204,204', '#cff': '204,255,255', '#fcf': '255,204,255' };

    // --- Dashboard Elements ---
    const timeElement = document.getElementById('time');
    const dateElement = document.getElementById('date');
    const greetingElement = document.getElementById('greeting');
    const addNoteBtn = document.getElementById('add-note-btn');
    const notesContainer = document.getElementById('notes-container');

    // --- Dashboard Functions ---
    // (These functions remain the same)
    function setBackgroundImage() {
        const apiKey = '6LTNce4u8PGdcfFJljsRPPcb2Q-0oyea8b9FKC66BrQ';
        const today = new Date().toISOString().slice(0, 10);
        const savedImage = JSON.parse(localStorage.getItem('backgroundImage'));
        if (savedImage && savedImage.date === today) {
            document.body.style.backgroundImage = `url('${savedImage.url}')`;
        } else {
            const apiUrl = `https://api.unsplash.com/photos/random?query=nature,new-zealand&orientation=landscape&client_id=${apiKey}`;
            fetch(apiUrl).then(response => response.json()).then(data => {
                const imageUrl = data.urls.regular;
                const newImage = { url: imageUrl, date: today };
                localStorage.setItem('backgroundImage', JSON.stringify(newImage));
                document.body.style.backgroundImage = `url('${imageUrl}')`;
                fetch(data.links.download_location, { headers: { 'Authorization': `Client-ID ${apiKey}` } });
            }).catch(error => console.error('Error fetching Unsplash image:', error));
        }
    }
    function updateTime() {
        const now = new Date();
        timeElement.textContent = now.toLocaleTimeString('en-NZ', { hour12: true });
    }
    function updateDate() {
        const now = new Date();
        const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
        dateElement.textContent = new Intl.DateTimeFormat('en-NZ', options).format(now);
    }
    function updateGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) greetingElement.textContent = 'Good morning.';
        else if (hour < 18) greetingElement.textContent = 'Good afternoon.';
        else greetingElement.textContent = 'Good evening.';
    }

    // --- Sticky Note Functions ---

    function saveNotes() {
        const notes = [];
        document.querySelectorAll('.sticky-note').forEach(note => {
            notes.push({
                id: note.id,
                left: note.style.left,
                top: note.style.top,
                width: note.style.width,
                height: note.style.height,
                content: note.querySelector('.note-content').innerHTML,
                isMinimized: note.classList.contains('minimized'),
                color: note.style.backgroundColor,
                zIndex: note.style.zIndex // Save the z-index
            });
        });
        localStorage.setItem('stickyNotes', JSON.stringify(notes));
    }

    function loadNotes() {
        const notes = JSON.parse(localStorage.getItem('stickyNotes')) || [];
        // Find the highest z-index from saved notes
        const maxZ = notes.reduce((max, note) => Math.max(max, parseInt(note.zIndex) || 2), 2);
        highestZ = maxZ;
        // Sort notes by z-index to create them in the correct order
        notes.sort((a, b) => (parseInt(a.zIndex) || 2) - (parseInt(b.zIndex) || 2));
        notes.forEach(noteData => createNote(noteData));
    }

    // NEW: Function to bring a note to the front
    const bringToFront = (note) => {
        highestZ++;
        note.style.zIndex = highestZ;
        saveNotes();
    };

    function createNote(data = {}) {
        const note = document.createElement('div');
        note.classList.add('sticky-note');
        if (data.isMinimized) note.classList.add('minimized');
        note.id = data.id || `note-${Date.now()}`;
        note.style.backgroundColor = data.color || 'rgba(255, 255, 204, 1)';
        note.style.zIndex = data.zIndex || highestZ; // Set z-index from saved data or current highest

        note.innerHTML = `
            <div class="note-header">
                <span class="note-title"></span>
                <div class="note-controls">
                    <button class="note-minimize" title="Minimize"><i class="fa-solid fa-window-minimize"></i></button>
                    <button class="note-settings" title="Settings"><i class="fa-solid fa-gear"></i></button>
                    <button class="note-close" title="Close"><i class="fa-solid fa-xmark"></i></button>
                </div>
            </div>
            <div class="note-settings-panel">
                <div class="color-swatches"><span>Color:</span></div>
                <div class="alpha-slider-container">
                    <span>Alpha:</span>
                    <input type="range" class="alpha-slider" min="0.1" max="1" step="0.05">
                </div>
            </div>
            <div class="note-content" contenteditable="true"></div>
        `;

        note.style.left = data.left || `${Math.floor(Math.random() * 50 + 20)}px`;
        note.style.top = data.top || `${Math.floor(Math.random() * 50 + 20)}px`;
        note.style.width = data.width || '250px';
        note.style.height = data.height || '250px';
        
        const content = note.querySelector('.note-content');
        content.innerHTML = data.content || '';

        const header = note.querySelector('.note-header');
        const title = note.querySelector('.note-title');
        const closeBtn = note.querySelector('.note-close');
        const minimizeBtn = note.querySelector('.note-minimize');
        const settingsBtn = note.querySelector('.note-settings');
        const settingsPanel = note.querySelector('.note-settings-panel');
        const alphaSlider = note.querySelector('.alpha-slider');
        
        const getRgba = (colorStr) => colorStr.match(/(\d+(\.\d+)?)/g).map(Number);
        
        alphaSlider.value = getRgba(note.style.backgroundColor)[3] || 1;

        const updateTitle = () => {
            const firstLine = content.innerText.split('\n')[0];
            title.textContent = firstLine.substring(0, 20) || 'New Note';
        };

        content.addEventListener('blur', () => {
            updateTitle();
            saveNotes();
        });

        makeDraggable(note, header);
        closeBtn.addEventListener('click', () => {
            notesContainer.removeChild(note);
            saveNotes();
        });
        minimizeBtn.addEventListener('click', () => {
            note.classList.toggle('minimized');
            saveNotes();
        });
        settingsBtn.addEventListener('click', () => {
            settingsPanel.classList.toggle('active');
        });

        // Add the listener to bring the note to the front on any click
        note.addEventListener('mousedown', () => bringToFront(note), { capture: true });

        const colors = Object.keys(HEX_TO_RGB);
        const swatchesContainer = note.querySelector('.color-swatches');
        colors.forEach(hexColor => {
            const swatch = document.createElement('div');
            swatch.classList.add('color-swatch');
            swatch.style.backgroundColor = hexColor;
            swatch.addEventListener('click', () => {
                const currentAlpha = alphaSlider.value;
                note.style.backgroundColor = `rgba(${HEX_TO_RGB[hexColor]}, ${currentAlpha})`;
                saveNotes();
            });
            swatchesContainer.appendChild(swatch);
        });
        
        alphaSlider.addEventListener('input', () => {
            const [r, g, b] = getRgba(note.style.backgroundColor);
            note.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${alphaSlider.value})`;
            saveNotes();
        });
        
        note.addEventListener('mouseup', saveNotes);
        
        notesContainer.appendChild(note);
        updateTitle();
    }

    function makeDraggable(element, handle) {
        let isDragging = false;
        let offsetX, offsetY;
        handle.addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetX = e.clientX - element.offsetLeft;
            offsetY = e.clientY - element.offsetTop;
            document.body.style.userSelect = 'none';
        });
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                element.style.left = `${e.clientX - offsetX}px`;
                element.style.top = `${e.clientY - offsetY}px`;
            }
        });
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                document.body.style.userSelect = 'auto';
                saveNotes();
            }
        });
    }

    addNoteBtn.addEventListener('click', () => {
        highestZ++;
        createNote({ zIndex: highestZ });
    });

    function init() {
        updateTime();
        updateDate();
        updateGreeting();
        setBackgroundImage();
        setInterval(updateTime, 1000);
        loadNotes();
    }

    init();
});
