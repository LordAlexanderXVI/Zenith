// Wait until the DOM is fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

    // Get references to the HTML elements
    const timeElement = document.getElementById('time');
    const dateElement = document.getElementById('date');
    const greetingElement = document.getElementById('greeting');

    // Function to update the time every second
    function updateTime() {
        const now = new Date();
        // Using toLocaleTimeString for a nice, clean format (e.g., 1:32:31 PM)
        // 'en-NZ' ensures it respects New Zealand's locale conventions
        timeElement.textContent = now.toLocaleTimeString('en-NZ');
    }

    // Function to set the date
    function updateDate() {
        const now = new Date();
        const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
        // Using Intl.DateTimeFormat for robust, localized date formatting
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

    // Set an interval to update the time every 1000 milliseconds (1 second)
    setInterval(updateTime, 1000);
});
