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
                isMinimized: note.classList.contains('minimized') // Save minimized state
            });
        });
        localStorage.setItem('stickyNotes', JSON.stringify(notes));
    }

    function loadNotes() {
        const notes = JSON.parse(localStorage.getItem('stickyNotes')) || [];
        notes.forEach(noteData => createNote(noteData));
    }

    function createNote(data = {}) {
        const note = document.createElement('div');
        note.classList.add('sticky-note');
        if (data.isMinimized) { // Restore minimized state on load
            note.classList.add('minimized');
        }
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

        note.style.left = data.left || `${Math.floor(Math.random() * 50 + 20)}px`;
        note.style.top = data.top || `${Math.floor(Math.random() * 50 + 20)}px`;
        note.style.width = data.width || '250px';
        // Only restore height if not minimized, otherwise CSS handles it
        if (!data.isMinimized) {
            note.style.height = data.height || '250px';
        }
        
        const content = note.querySelector('.note-content');
        content.innerHTML = data.content || '';

        const header = note.querySelector('.note-header');
        const title = note.querySelector('.note-title');
        const closeBtn = note.querySelector('.note-close');
        const minimizeBtn = note.querySelector('.note-minimize'); // Get the minimize button
        
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
        
        // NEW: Event listener for the minimize button
        minimizeBtn.addEventListener('click', () => {
            note.classList.toggle('minimized');
            // If we're restoring the note, re-apply the saved height
            if (!note.classList.contains('minimized')) {
                note.style.height = data.height || '250px';
            }
            saveNotes();
        });

        new ResizeObserver(() => {
            // Only save size if not minimized
            if (!note.classList.contains('minimized')) {
                data.height = note.style.height; // Update height data for restoring
                saveNotes();
            }
        }).observe(note);

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
                saveNotes();
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
        loadNotes();
    }

    init();
});
