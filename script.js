document.addEventListener('DOMContentLoaded', () => {
    // --- Dashboard Elements ---
    const timeElement = document.getElementById('time');
    const dateElement = document.getElementById('date');
    const greetingElement = document.getElementById('greeting');
    
    // --- Sticky Note Elements ---
    const addNoteBtn = document.getElementById('add-note-btn');
    const notesContainer = document.getElementById('notes-container');

    // --- Dashboard Functions ---
    // (These functions remain the same: setBackgroundImage, updateTime, updateDate, updateGreeting)
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

    function createNote() {
        const note = document.createElement('div');
        note.classList.add('sticky-note');
        
        // Create the note's HTML structure
        note.innerHTML = `
            <div class="note-header">
                <div class="note-controls">
                    <button class="note-minimize"><i class="fa-solid fa-window-minimize"></i></button>
                    <button class="note-settings"><i class="fa-solid fa-gear"></i></button>
                    <button class="note-close"><i class="fa-solid fa-xmark"></i></button>
                </div>
            </div>
            <div class="note-content" contenteditable="true"></div>
        `;

        note.style.left = `${Math.floor(Math.random() * 50 + 20)}px`;
        note.style.top = `${Math.floor(Math.random() * 50 + 20)}px`;

        const header = note.querySelector('.note-header');
        const closeBtn = note.querySelector('.note-close');
        
        makeDraggable(note, header);

        // Add functionality to the close button
        closeBtn.addEventListener('click', () => {
            notesContainer.removeChild(note);
        });

        notesContainer.appendChild(note);
    }

    function makeDraggable(element, handle) {
        let isDragging = false;
        let offsetX, offsetY;

        handle.addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetX = e.clientX - element.offsetLeft;
            offsetY = e.clientY - element.offsetTop;
            document.body.style.userSelect = 'none'; // Prevent text selection during drag
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                element.style.left = `${e.clientX - offsetX}px`;
                element.style.top = `${e.clientY - offsetY}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            document.body.style.userSelect = 'auto'; // Re-enable text selection
        });
    }

    addNoteBtn.addEventListener('click', createNote);

    // --- Initial Application Setup ---
    function init() {
        updateTime();
        updateDate();
        updateGreeting();
        setBackgroundImage();
        setInterval(updateTime, 1000);
    }

    init();
});
