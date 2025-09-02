document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = 'https://task-tracker-cp1x.onrender.com'; 
    
    const taskForm = document.getElementById('task-form');
    const taskList = document.getElementById('task-list');
    const searchBox = document.getElementById('search-box');
    const filterStatus = document.getElementById('filter-status');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    let allTasks = [];

    // --- API Functions ---

    const fetchTasks = async () => {
        try {
            const response = await fetch(apiUrl);
            allTasks = await response.json();
            renderTasks();
            checkDeadlines();
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const addTask = async (taskData) => {
        try {
            await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData),
            });
            fetchTasks(); // Re-fetch to update the list
        } catch (error) {
            console.error('Error adding task:', error);
        }
    };

    const updateTaskStatus = async (id, completed) => {
        try {
            await fetch(`${apiUrl}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed }),
            });
            fetchTasks();
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const deleteTask = async (id) => {
        try {
            await fetch(`${apiUrl}/${id}`, {
                method: 'DELETE',
            });
            fetchTasks();
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    // --- Rendering and UI ---

    const renderTasks = () => {
        taskList.innerHTML = '';
        
        const searchTerm = searchBox.value.toLowerCase();
        const statusFilter = filterStatus.value;

        const filteredTasks = allTasks.filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(searchTerm) || task.description.toLowerCase().includes(searchTerm);
            const matchesStatus = statusFilter === 'all' || (statusFilter === 'completed' && task.completed) || (statusFilter === 'pending' && !task.completed);
            return matchesSearch && matchesStatus;
        });
        
        filteredTasks.forEach(task => {
            const taskEl = document.createElement('div');
            taskEl.className = `task-item ${task.completed ? 'completed' : ''}`;
            taskEl.innerHTML = `
                <div class="task-details">
                    <h3>${task.title}</h3>
                    <p>${task.description}</p>
                    <small>Deadline: ${task.deadline}</small>
                </div>
                <div class="task-actions">
                    <button class="status-btn ${task.completed ? 'pending-btn' : 'complete-btn'}">
                        ${task.completed ? 'Mark Pending' : 'Mark Complete'}
                    </button>
                    <button class="delete-btn">Delete</button>
                </div>
            `;

            taskEl.querySelector('.status-btn').addEventListener('click', () => updateTaskStatus(task.id, !task.completed));
            taskEl.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));
            
            taskList.appendChild(taskEl);
        });
        updateProgressBar();
    };

    const updateProgressBar = () => {
        const completedTasks = allTasks.filter(task => task.completed).length;
        const totalTasks = allTasks.length;
        const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        progressBar.style.width = `${percentage}%`;
        progressText.textContent = `${percentage}%`;
    };

    const checkDeadlines = () => {
        const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
        const dueTodayTasks = allTasks.filter(task => task.deadline === today && !task.completed);

        if (dueTodayTasks.length > 0) {
            const reminderList = document.getElementById('reminder-list');
            reminderList.innerHTML = '';
            dueTodayTasks.forEach(task => {
                const li = document.createElement('li');
                li.textContent = task.title;
                reminderList.appendChild(li);
            });
            document.getElementById('reminder-popup').className = 'popup';
        }
    };

    // --- Event Listeners ---

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newTask = {
            title: document.getElementById('task-title').value,
            description: document.getElementById('task-desc').value,
            deadline: document.getElementById('task-deadline').value,
        };
        addTask(newTask);
        taskForm.reset();
    });

    searchBox.addEventListener('input', renderTasks);
    filterStatus.addEventListener('change', renderTasks);

    // Initial Fetch
    fetchTasks();
});

// --- Popup Global Functions ---
function closePopup() {
    document.getElementById('reminder-popup').className = 'popup-hidden';

}

