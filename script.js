document.addEventListener('DOMContentLoaded', () => {
    let highestZ = 2;
    const HEX_TO_RGB = { '#ffc': '255,255,204', '#cfc': '204,255,204', '#ccf': '204,204,255', '#fcc': '255,204,204', '#cff': '204,255,255', '#fcf': '255,204,255' };

    // --- Element Selectors ---
    const timeElement = document.getElementById('time');
    const dateElement = document.getElementById('date');
    const greetingElement = document.getElementById('greeting');
    const addNoteBtn = document.getElementById('add-note-btn');
    const notesContainer = document.getElementById('notes-container');
    const noteDock = document.getElementById('note-dock');
    const dockToggleBtn = document.getElementById('dock-toggle-btn');
    const dockList = document.getElementById('dock-list');
    const dockAllBtn = document.getElementById('dock-all-btn');
    const confirmModal = document.getElementById('confirm-modal');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const confirmCancelBtn = document.getElementById('confirm-cancel-btn');
    const dontAskAgainCheckbox = document.getElementById('dont-ask-again');

    // --- Core Data Functions ---
    const getAllNotes = () => JSON.parse(localStorage.getItem('stickyNotes')) || [];
    const saveAllNotes = (notes) => localStorage.setItem('stickyNotes', JSON.stringify(notes));

    // --- Custom Confirmation Logic ---
    let confirmCallback = null;
    function showDeleteConfirmation(callback) {
        if (localStorage.getItem('skipDeleteConfirmation') === 'true') {
            callback();
            return;
        }
        confirmCallback = callback;
        confirmModal.classList.remove('hidden');
    }

    confirmDeleteBtn.addEventListener('click', () => {
        if (dontAskAgainCheckbox.checked) {
            localStorage.setItem('skipDeleteConfirmation', 'true');
        }
        if (confirmCallback) {
            confirmCallback();
        }
        confirmModal.classList.add('hidden');
    });

    confirmCancelBtn.addEventListener('click', () => {
        confirmModal.classList.add('hidden');
    });
    
    // --- UI Rendering ---
    function loadUI() {
        notesContainer.innerHTML = '';
        const notes = getAllNotes();
        highestZ = notes.reduce((max, note) => Math.max(max, parseInt(note.zIndex) || 2), 2);
        notes.filter(n => !n.isDocked).sort((a, b) => (a.zIndex || 2) - (b.zIndex || 2)).forEach(createNoteElement);
        renderDock();
    }

    function renderDock() {
        const notes = getAllNotes();
        dockList.innerHTML = '';
        notes.filter(n => n.isDocked).forEach(noteData => {
            const li = document.createElement('li');
            li.className = 'docked-note-item';
            li.dataset.noteId = noteData.id;
            const titleSpan = document.createElement('span');
            const firstLine = new DOMParser().parseFromString(noteData.content || '', 'text/html').body.innerText.split('\n')[0];
            titleSpan.textContent = firstLine.substring(0, 20) || 'Docked Note';
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'docked-note-delete-btn';
            deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
            
            deleteBtn.addEventListener('mousedown', e => e.stopPropagation());
            deleteBtn.addEventListener('click', e => {
                e.stopPropagation();
                showDeleteConfirmation(() => {
                    saveAllNotes(getAllNotes().filter(n => n.id !== noteData.id));
                    loadUI();
                });
            });

            li.addEventListener('mousedown', e => undockNote(noteData.id, e));
            li.appendChild(titleSpan);
            li.appendChild(deleteBtn);
            dockList.appendChild(li);
        });
    }

    // --- Note Creation and Manipulation ---
    function createNoteElement(data) {
        const note = document.createElement('div');
        note.className = 'sticky-note';
        if (data.isMinimized) note.classList.add('minimized');
        note.id = data.id;
        note.style.backgroundColor = data.color || 'rgba(255, 255, 204, 1)';
        note.style.zIndex = data.zIndex || highestZ;
        note.style.left = data.left || `${Math.floor(Math.random() * 50 + 20)}px`;
        note.style.top = data.top || `${Math.floor(Math.random() * 50 + 20)}px`;
        note.style.width = data.width || '250px';
        note.style.height = data.height || '250px';

        note.innerHTML = `
            <div class="note-header"><span class="note-title"></span><div class="note-controls"><button class="note-minimize" title="Minimize"><i class="fa-solid fa-window-minimize"></i></button><button class="note-settings" title="Settings"><i class="fa-solid fa-gear"></i></button><button class="note-close" title="Close"><i class="fa-solid fa-xmark"></i></button></div></div>
            <div class="note-settings-panel"><div class="color-swatches"><span>Color:</span></div><div class="alpha-slider-container"><span>Alpha:</span><input type="range" class="alpha-slider" min="0.1" max="1" step="0.05"></div></div>
            <div class="note-content" contenteditable="true"></div>`;
        
        const content = note.querySelector('.note-content');
        content.innerHTML = data.content || '';

        const updateAndSave = () => {
            let notes = getAllNotes();
            let noteIndex = notes.findIndex(n => n.id === note.id);
            if (noteIndex === -1) return;
            const firstLine = content.innerText.split('\n')[0];
            note.querySelector('.note-title').textContent = firstLine.substring(0, 20) || 'New Note';
            notes[noteIndex] = { ...notes[noteIndex], left: note.style.left, top: note.style.top, width: note.style.width, height: note.style.height, content: content.innerHTML, isMinimized: note.classList.contains('minimized'), color: note.style.backgroundColor, zIndex: note.style.zIndex };
            saveAllNotes(notes);
        };
        
        makeDraggable(note, note.querySelector('.note-header'), updateAndSave);
        const closeBtn = note.querySelector('.note-close');
        closeBtn.addEventListener('click', () => {
            showDeleteConfirmation(() => {
                note.remove();
                saveAllNotes(getAllNotes().filter(n => n.id !== note.id));
            });
        });
        note.querySelector('.note-minimize').addEventListener('click', () => { note.classList.toggle('minimized'); updateAndSave(); });
        note.querySelector('.note-settings').addEventListener('click', () => note.querySelector('.note-settings-panel').classList.toggle('active'));
        note.addEventListener('mousedown', () => { highestZ++; note.style.zIndex = highestZ; updateAndSave(); }, { capture: true });
        
        const alphaSlider = note.querySelector('.alpha-slider');
        const getRgba = (colorStr) => colorStr.match(/(\d+(\.\d+)?)/g).map(Number);
        alphaSlider.value = getRgba(note.style.backgroundColor)[3] || 1;
        
        Object.keys(HEX_TO_RGB).forEach(hexColor => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.style.backgroundColor = hexColor;
            swatch.addEventListener('click', () => { note.style.backgroundColor = `rgba(${HEX_TO_RGB[hexColor]}, ${alphaSlider.value})`; updateAndSave(); });
            note.querySelector('.color-swatches').appendChild(swatch);
        });

        alphaSlider.addEventListener('input', () => { const [r, g, b] = getRgba(note.style.backgroundColor); note.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${alphaSlider.value})`; updateAndSave(); });
        content.addEventListener('blur', updateAndSave);
        note.addEventListener('mouseup', updateAndSave);
        notesContainer.appendChild(note);
    }

    function makeDraggable(element, handle, onDragEnd) {
        handle.addEventListener('mousedown', (e) => {
            let isDragging = true;
            let offsetX = e.clientX - element.offsetLeft;
            let offsetY = e.clientY - element.offsetTop;
            document.body.style.userSelect = 'none';
            const onMouseMove = (moveEvent) => {
                if (!isDragging) return;
                element.style.left = `${moveEvent.clientX - offsetX}px`;
                element.style.top = `${moveEvent.clientY - offsetY}px`;
                if (noteDock.classList.contains('active') && moveEvent.clientX < noteDock.offsetWidth) { noteDock.classList.add('hover'); } else { noteDock.classList.remove('hover'); }
            };
            const onMouseUp = (upEvent) => {
                if (!isDragging) return;
                isDragging = false;
                document.body.style.userSelect = 'auto';
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                if (noteDock.classList.contains('active') && upEvent.clientX < noteDock.offsetWidth) {
                    let notes = getAllNotes();
                    const noteIndex = notes.findIndex(n => n.id === element.id);
                    if (noteIndex !== -1) { notes[noteIndex].isDocked = true; saveAllNotes(notes); loadUI(); }
                } else { onDragEnd(); }
                noteDock.classList.remove('hover');
            };
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    }

    function undockNote(noteId, initialEvent) {
        let notes = getAllNotes();
        const noteIndex = notes.findIndex(n => n.id === noteId);
        if (noteIndex === -1) return;
        const noteData = notes[noteIndex];
        noteData.isDocked = false;
        const noteWidth = parseInt(noteData.width) || 250;
        noteData.left = `${initialEvent.clientX - (noteWidth / 2)}px`;
        noteData.top = `${initialEvent.clientY - 15}px`;
        saveAllNotes(notes);
        loadUI();
        const newNoteElement = document.getElementById(noteId);
        if (newNoteElement) {
            const header = newNoteElement.querySelector('.note-header');
            const fakeEvent = new MouseEvent('mousedown', { bubbles: true, cancelable: true, clientX: initialEvent.clientX, clientY: initialEvent.clientY });
            header.dispatchEvent(fakeEvent);
        }
    }

    // --- Button Event Listeners ---
    addNoteBtn.addEventListener('click', () => {
        let notes = getAllNotes();
        highestZ++;
        const newNoteData = { id: `note-${Date.now()}`, zIndex: highestZ, isDocked: false };
        notes.push(newNoteData);
        saveAllNotes(notes);
        createNoteElement(newNoteData);
    });
    
    dockAllBtn.addEventListener('click', () => {
        let notes = getAllNotes();
        notes.forEach(note => { if (!note.isDocked) note.isDocked = true; });
        saveAllNotes(notes);
        loadUI();
    });

    // --- Dashboard Clock/Greeting Functions & Init ---
    const dashboardFunctions = { /* ... */ };
    function init() {
        // (function definitions are below)
        dashboardFunctions.updateTime();
        dashboardFunctions.updateDate();
        dashboardFunctions.updateGreeting();
        dashboardFunctions.setBackgroundImage();
        setInterval(dashboardFunctions.updateTime, 100);
        loadUI();
    }

    dashboardFunctions.setBackgroundImage = () => {
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
    };
    dashboardFunctions.updateTime = () => {
        const now = new Date();
        timeElement.textContent = now.toLocaleTimeString('en-NZ', { hour12: true });
    };
    dashboardFunctions.updateDate = () => {
        const now = new Date();
        const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
        dateElement.textContent = new Intl.DateTimeFormat('en-NZ', options).format(now);
    };
    dashboardFunctions.updateGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) greetingElement.textContent = 'Good morning.';
        else if (hour < 18) greetingElement.textContent = 'Good afternoon.';
        else greetingElement.textContent = 'Good evening.';
    };
    
    dockToggleBtn.addEventListener('click', () => noteDock.classList.toggle('active'));
    init();
});
