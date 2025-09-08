// Wait until the DOM is fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
    // Get references to the HTML elements
    const timeElement = document.getElementById('time');
    const dateElement = document.getElementById('date');
    const greetingElement = document.getElementById('greeting');

    // Function to fetch and set a background via the official Unsplash API
    function setBackgroundImage() {
        // !! IMPORTANT: Make sure your Unsplash Access Key is pasted here
        const apiKey = '6LTNce4u8PGdcfFJljsRPPcb2Q-0oyea8b9FKC66BrQ';
        const apiUrl = `https://api.unsplash.com/photos/random?query=nature,new-zealand&orientation=landscape&client_id=${apiKey}`;

        // Step 1: Fetch the random image data
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`API request failed with status ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Set the background image using the URL from the response
                const imageUrl = data.urls.regular;
                document.body.style.backgroundImage = `url('${imageUrl}')`;

                // Step 2 (CRUCIAL): Notify Unsplash of the download for API compliance
                // This second fetch call sends the required confirmation.
                fetch(data.links.download_location, {
                    headers: {
                        'Authorization': `Client-ID ${apiKey}`
                    }
                });
            })
            .catch(error => {
                console.error('Error fetching Unsplash image:', error);
                document.body.style.backgroundColor = '#1a1a1a';
            });
    }

    // Function to update the time every second
    function updateTime() {
        const now = new Date();
        timeElement.textContent = now.toLocaleTimeString('en-NZ', { hour12: true });
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
