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
        const today = new Date().toISOString().slice(0, 10);
        const savedImage = JSON.parse(localStorage.getItem('backgroundImage'));

        if (savedImage && savedImage.date === today) {
            document.body.style.backgroundImage = `url('${savedImage.url}')`;
        } else {
            const apiUrl = `https://api.unsplash.com/photos/random?query=nature,new-zealand&orientation=landscape&client_id=${apiKey}`;
            
            fetch(apiUrl)
                .then(response => response.json())
                .then(data => {
                    const imageUrl = data.urls.regular;
                    const newImage = { url: imageUrl, date: today };
                    localStorage.setItem('backgroundImage', JSON.stringify(newImage));
                    document.body.style.backgroundImage = `url('${imageUrl}')`;
                    fetch(data.links.download_location, {
                        headers: { 'Authorization': `Client-ID ${apiKey}` }
                    });
                })
                .catch(error => console.error('Error fetching Unsplash image:', error));
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
        
        note.style.left = `${Math.floor(Math.random() * 50 + 20)}px`;
        note.style.top = `${Math.floor(Math.random() * 50 + 20)}px`;

        // --- NEW LOGIC STARTS HERE ---

        // 1. Make the entire note element editable
        note.contentEditable = true;

        // 2. Add a placeholder
        const placeholder = document.createElement('span');
        placeholder.classList.add('placeholder');
        placeholder.textContent = 'Type here...';
        note.appendChild(placeholder);

        // 3. Show/hide placeholder based on content
        note.addEventListener('focus', () => {
            if (note.contains(placeholder)) {
                note.removeChild(placeholder);
            }
        });

        note.addEventListener('blur', () => {
            if (note.textContent.trim() === '') {
                note.innerHTML = ''; // Clear any residual formatting
                note.appendChild(placeholder);
            }
        });
        
        // --- NEW LOGIC ENDS HERE ---

        notesContainer.appendChild(note);
        makeDraggable(note);
    }

    function makeDraggable(element) {
        let isDragging = false;
        let offsetX, offsetY;

        element.addEventListener('mousedown', (e) => {
            // Only start dragging if the target is the note itself, not text inside it
            if (e.target === element) {
                isDragging = true;
                offsetX = e.clientX - element.offsetLeft;
                offsetY = e.clientY - element.offsetTop;
                e.preventDefault();
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                element.style.left = `${e.clientX - offsetX}px`;
                element.style.top = `${e.clientY - offsetY}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
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
