document.addEventListener('DOMContentLoaded', () => {
    // --- Dashboard Elements ---
    const timeElement = document.getElementById('time');
    const dateElement = document.getElementById('date');
    const greetingElement = document.getElementById('greeting');
    
    // --- Sticky Note Elements ---
    const addNoteBtn = document.getElementById('add-note-btn');
    const notesContainer = document.getElementById('notes-container');

    // --- Dashboard Functions ---

    function setBackgroundImage() {
        const apiKey = '6LTNce4u8PGdcfFJljsRPPcb2Q-0oyea8b9FKC66BrQ';
        const apiUrl = `https://api.unsplash.com/photos/random?query=nature,new-zealand&orientation=landscape&client_id=${apiKey}`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                document.body.style.backgroundImage = `url('${data.urls.regular}')`;
                fetch(data.links.download_location, {
                    headers: { 'Authorization': `Client-ID ${apiKey}` }
                });
            })
            .catch(error => {
                console.error('Error fetching Unsplash image:', error);
                document.body.style.backgroundColor = '#1a1a1a';
            });
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
        
        // Give each new note a slightly different random position to avoid perfect stacking
        note.style.left = `${Math.floor(Math.random() * 50 + 20)}px`;
        note.style.top = `${Math.floor(Math.random() * 50 + 20)}px`;

        notesContainer.appendChild(note);
        makeDraggable(note); // Make the new note draggable
    }

    // NEW: Function to make an element draggable
    function makeDraggable(element) {
        let isDragging = false;
        let offsetX, offsetY;

        // When the mouse button is pressed down on the note
        element.addEventListener('mousedown', (e) => {
            isDragging = true;
            // Calculate the mouse's position relative to the note's top-left corner
            offsetX = e.clientX - element.offsetLeft;
            offsetY = e.clientY - element.offsetTop;
            // Prevent text selection while dragging
            e.preventDefault();
        });

        // When the mouse moves anywhere on the page
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                // Set the note's new position based on the mouse's movement
                element.style.left = `${e.clientX - offsetX}px`;
                element.style.top = `${e.clientY - offsetY}px`;
            }
        });

        // When the mouse button is released
        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    // Event listener for the "Add Note" button
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
