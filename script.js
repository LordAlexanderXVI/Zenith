document.addEventListener('DOMContentLoaded', () => {
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

    // NEW: Function to save all notes to localStorage
    function saveNotes() {
        const notes = [];
        document.querySelectorAll('.sticky-note').forEach(note => {
            notes.push({
                id: note.id,
                left: note.style.left,
                top: note.style.top,
                width: note.style.width,
                height: note.style.height,
                content: note.querySelector('.note-content').innerHTML
            });
        });
        localStorage.setItem('stickyNotes', JSON.stringify(notes));
    }

    // NEW: Function to load notes from localStorage
    function loadNotes() {
        const notes = JSON.parse(localStorage.getItem('stickyNotes')) || [];
        notes.forEach(noteData => createNote(noteData));
    }

    // UPDATED: createNote now accepts data to restore a saved note
    function createNote(data = {}) {
        const note = document.createElement('div');
        note.classList.add('sticky-note');
        // Use saved data or create a new unique ID
        note.id = data.id || `note-${Date.now()}`;

        note.innerHTML = `
            <div class="note-header">
                <span class="note-title"></span>
                <div class="note-controls">
                    <button class="note-minimize" title="Minimize"><i class="fa-solid fa-window-minimize"></i></button>
                    <button class="note-settings" title="Settings"><i class="fa-solid fa-gear"></i></button>
                    <button class="note-close" title="Close"><i class="fa-solid fa-xmark"></i></button>
                </div>
            </div>
            <div class="note-content" contenteditable="true"></div>
        `;

        // Restore position, size, and content from saved data
        note.style.left = data.left || `${Math.floor(Math.random() * 50 + 20)}px`;
        note.style.top = data.top || `${Math.floor(Math.random() * 50 + 20)}px`;
        note.style.width = data.width || '250px';
        note.style.height = data.height || '250px';
        
        const content = note.querySelector('.note-content');
        content.innerHTML = data.content || '';

        const header = note.querySelector('.note-header');
        const title = note.querySelector('.note-title');
        const closeBtn = note.querySelector('.note-close');
        
        // Function to update the title from the first line of content
        const updateTitle = () => {
            const firstLine = content.innerText.split('\n')[0];
            title.textContent = firstLine.substring(0, 20) || 'New Note'; // Truncate long titles
        };

        // Update title when the note loses focus (after typing)
        content.addEventListener('blur', () => {
            updateTitle();
            saveNotes();
        });

        makeDraggable(note, header);

        closeBtn.addEventListener('click', () => {
            notesContainer.removeChild(note);
            saveNotes();
        });

        // Use a ResizeObserver to detect when the note is resized
        new ResizeObserver(saveNotes).observe(note);

        notesContainer.appendChild(note);
        updateTitle(); // Set initial title
    }

    function makeDraggable(element, handle) {
        let isDragging = false;
        let offsetX, offsetY;

        handle.addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetX = e.clientX - element.offsetLeft;
            offsetY = e.clientY - element.offsetTop;
            document.body.style.userSelect = 'none';
            e.preventDefault();
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
                saveNotes(); // Save position after dragging
            }
        });
    }

    addNoteBtn.addEventListener('click', () => createNote());

    // --- Initial Application Setup ---
    function init() {
        updateTime();
        updateDate();
        updateGreeting();
        setBackgroundImage();
        setInterval(updateTime, 1000);
        loadNotes(); // Load existing notes on startup
    }

    init();
});
