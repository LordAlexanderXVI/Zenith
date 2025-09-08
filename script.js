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
        const today = new Date().toISOString().slice(0, 10); // Gets date as "YYYY-MM-DD"
        const savedImage = JSON.parse(localStorage.getItem('backgroundImage'));

        // If an image was saved today, use it.
        if (savedImage && savedImage.date === today) {
            document.body.style.backgroundImage = `url('${savedImage.url}')`;
        } else {
            // Otherwise, fetch a new one.
            const apiUrl = `https://api.unsplash.com/photos/random?query=nature,new-zealand&orientation=landscape&client_id=${apiKey}`;
            
            fetch(apiUrl)
                .then(response => response.json())
                .then(data => {
                    const imageUrl = data.urls.regular;
                    // Save the new image URL and today's date to localStorage
                    const newImage = {
                        url: imageUrl,
                        date: today
                    };
                    localStorage.setItem('backgroundImage', JSON.stringify(newImage));
                    
                    // Set the background and confirm the download with Unsplash
                    document.body.style.backgroundImage = `url('${imageUrl}')`;
                    fetch(data.links.download_location, {
                        headers: { 'Authorization': `Client-ID ${apiKey}` }
                    });
                })
                .catch(error => {
                    console.error('Error fetching Unsplash image:', error);
                    document.body.style.backgroundColor = '#1a1a1a';
                });
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

        notesContainer.appendChild(note);
        makeDraggable(note);
    }

    function makeDraggable(element) {
        let isDragging = false;
        let offsetX, offsetY;

        element.addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetX = e.clientX - element.offsetLeft;
            offsetY = e.clientY - element.offsetTop;
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
