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
        notesContainer.appendChild(note);
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
