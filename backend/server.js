const express = require('express');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allows requests from your Netlify frontend
app.use(express.json()); // Parses incoming JSON requests

const TASKS_FILE = './tasks.json';

// Helper function to read tasks from the file
const readTasks = () => {
    const data = fs.readFileSync(TASKS_FILE);
    return JSON.parse(data);
};

// Helper function to write tasks to the file
const writeTasks = (tasks) => {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
};

// API Endpoints

// GET /tasks → Get all tasks
app.get('/tasks', (req, res) => {
    try {
        const tasks = readTasks();
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Error reading tasks' });
    }
});

// POST /tasks → Add a new task
app.post('/tasks', (req, res) => {
    try {
        const tasks = readTasks();
        const newTask = {
            id: Date.now(), // Simple unique ID
            title: req.body.title,
            description: req.body.description,
            deadline: req.body.deadline,
            completed: false,
        };
        tasks.push(newTask);
        writeTasks(tasks);
        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({ message: 'Error creating task' });
    }
});

// PUT /tasks/:id → Update a task (mark complete/pending)
app.put('/tasks/:id', (req, res) => {
    try {
        const tasks = readTasks();
        const taskId = parseInt(req.params.id);
        const taskIndex = tasks.findIndex(t => t.id === taskId);

        if (taskIndex === -1) {
            return res.status(404).json({ message: 'Task not found' });
        }

        tasks[taskIndex].completed = req.body.completed;
        writeTasks(tasks);
        res.json(tasks[taskIndex]);
    } catch (error) {
        res.status(500).json({ message: 'Error updating task' });
    }
});

// DELETE /tasks/:id → Delete a task
app.delete('/tasks/:id', (req, res) => {
    try {
        let tasks = readTasks();
        const taskId = parseInt(req.params.id);
        const updatedTasks = tasks.filter(t => t.id !== taskId);

        if (tasks.length === updatedTasks.length) {
            return res.status(404).json({ message: 'Task not found' });
        }

        writeTasks(updatedTasks);
        res.status(204).send(); // No content
    } catch (error) {
        res.status(500).json({ message: 'Error deleting task' });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});