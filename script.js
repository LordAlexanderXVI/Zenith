// Wait until the DOM is fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
    // --- Dashboard Elements ---
    const timeElement = document.getElementById('time');
    const dateElement = document.getElementById('date');
    const greetingElement = document.getElementById('greeting');

    // --- To-Do Elements ---
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');

    // --- Dashboard Functions ---

    // Function to fetch and set a background via the official Unsplash API
    function setBackgroundImage() {
        const apiKey = 'jY5-G-OesrK34tHpuAEwEIMlq0L5k3uW8jCq-I4qf2E';
        const apiUrl = `https://api.unsplash.com/photos/random?query=nature,new-zealand&orientation=landscape&client_id=${apiKey}`;

        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`API request failed with status ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                const imageUrl = data.urls.regular;
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
    
    // --- To-Do Functions ---

    // Function to load tasks from localStorage
    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(task => createTaskElement(task.text, task.completed));
    }

    // Function to save tasks to localStorage
    function saveTasks() {
        const tasks = [];
        document.querySelectorAll('.todo-item').forEach(item => {
            tasks.push({
                text: item.textContent,
                completed: item.classList.contains('completed')
            });
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Function to create a new task element in the list
    function createTaskElement(taskText, isCompleted = false) {
        const li = document.createElement('li');
        li.textContent = taskText;
        li.classList.add('todo-item');
        if (isCompleted) {
            li.classList.add('completed');
        }

        // Event listener to toggle completion
        li.addEventListener('click', () => {
            li.classList.toggle('completed');
            saveTasks();
        });

        todoList.appendChild(li);
    }

    // Event listener for the input box
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && todoInput.value.trim() !== '') {
            createTaskElement(todoInput.value.trim());
            todoInput.value = ''; // Clear the input box
            saveTasks();
        }
    });

    // --- Initial Application Setup ---
    function init() {
        updateTime();
        updateDate();
        updateGreeting();
        setBackgroundImage();
        setInterval(updateTime, 1000);
        loadTasks(); // Load tasks when the app starts
    }

    init();
});
