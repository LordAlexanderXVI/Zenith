// Wait until the DOM is fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

    // Get references to the HTML elements
    const timeElement = document.getElementById('time');
    const dateElement = document.getElementById('date');
    const greetingElement = document.getElementById('greeting');

    // --- UPDATED: Function to set a background image ---
    function setBackgroundImage() {
        // We define the URL that provides a random image.
        const imageUrl = 'https://source.unsplash.com/random/1920x1080/?nature,water,new-zealand';
        
        // We set the background image directly. The browser will handle
        // the redirect from source.unsplash.com securely.
        document.body.style.backgroundImage = `url('${imageUrl}')`;
    }

    // Function to update the time every second
    function updateTime() {
        const now = new Date();
        timeElement.textContent = now.toLocaleTimeString('en-NZ');
    }

    // Function to set the date
    function updateDate() {
        const now = new Date();
        const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
        dateElement.textContent = new Intl.DateTimeFormat('en-NZ', options).format(now);
    }

    // Function to set the greeting based on the time of day
    function updateGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) {
            greetingElement.textContent = 'Good morning.';
        } else if (hour < 18) {
            greetingElement.textContent = 'Good afternoon.';
        } else {
            greetingElement.textContent = 'Good evening.';
        }
    }
    
    // Initial calls to display content immediately on load
    updateTime();
    updateDate();
    updateGreeting();
    setBackgroundImage();

    // Set an interval to update the time every 1000 milliseconds (1 second)
    setInterval(updateTime, 1000);
});
