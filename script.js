// ===== DATA STRUCTURE =====
let tasks = [];
let taskIdCounter = 0;

// ===== DOM ELEMENTS =====
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const taskCount = document.getElementById('taskCount');
const errorMessage = document.getElementById('errorMessage');

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    loadTasksFromStorage();
    renderTasks();
    updateTaskCount();
});

// ===== EVENT LISTENERS =====
taskForm.addEventListener('submit', handleAddTask);

// ===== FUNCTIONS =====

/**
 * Handle form submission to add a new task
 * @param {Event} e - Form submit event
 */
function handleAddTask(e) {
    e.preventDefault();
    
    const taskText = taskInput.value.trim();
    
    // Validation
    if (!taskText) {
        showError('Veuillez entrer une tâche valide');
        return;
    }
    
    if (taskText.length > 100) {
        showError('La tâche ne peut pas dépasser 100 caractères');
        return;
    }
    
    // Create task
    const newTask = {
        id: ++taskIdCounter,
        text: taskText,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    // Add to array
    tasks.push(newTask);
    
    // Save to localStorage
    saveTasksToStorage();
    
    // Update UI
    renderTasks();
    updateTaskCount();
    
    // Clear input
    taskInput.value = '';
    clearError();
}

/**
 * Render all tasks to the DOM
 */
function renderTasks() {
    // Clear existing list
    taskList.innerHTML = '';
    
    // Check if empty
    if (tasks.length === 0) {
        taskList.innerHTML = `
            <li class="empty-state">
                <p>Aucune tâche pour le moment</p>
                <p>Ajoutez votre première tâche ci-dessus !</p>
            </li>
        `;
        return;
    }
    
    // Render each task
    tasks.forEach(task => {
        const taskElement = createTaskElement(task);
        taskList.appendChild(taskElement);
    });
}

/**
 * Create a task DOM element
 * @param {Object} task - Task object
 * @returns {HTMLElement} Task list item
 */
function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    li.dataset.id = task.id;
    
    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.completed;
    checkbox.setAttribute('aria-label', 'Marquer comme terminée');
    checkbox.addEventListener('change', () => toggleTaskComplete(task.id));
    
    // Task text (using textContent for XSS prevention)
    const span = document.createElement('span');
    span.className = 'task-text';
    span.textContent = task.text; // SECURITY: prevents XSS
    
    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete';
    deleteBtn.textContent = 'Supprimer';
    deleteBtn.setAttribute('aria-label', `Supprimer ${task.text}`);
    deleteBtn.addEventListener('click', () => deleteTask(task.id));
    
    // Append elements
    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);
    
    return li;
}

/**
 * Toggle task completion status
 * @param {number} taskId - ID of task to toggle
 */
function toggleTaskComplete(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasksToStorage();
        renderTasks();
        updateTaskCount();
    }
}

/**
 * Delete a task
 * @param {number} taskId - ID of task to delete
 */
function deleteTask(taskId) {
    tasks = tasks.filter(t => t.id !== taskId);
    saveTasksToStorage();
    renderTasks();
    updateTaskCount();
}

/**
 * Update task count display
 */
function updateTaskCount() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    taskCount.textContent = `${total} tâche(s) - ${completed} terminée(s)`;
}

/**
 * Save tasks to localStorage
 */
function saveTasksToStorage() {
    try {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        localStorage.setItem('taskIdCounter', taskIdCounter.toString());
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        showError('Impossible de sauvegarder les tâches');
    }
}

/**
 * Load tasks from localStorage
 */
function loadTasksFromStorage() {
    try {
        const storedTasks = localStorage.getItem('tasks');
        const storedCounter = localStorage.getItem('taskIdCounter');
        
        if (storedTasks) {
            tasks = JSON.parse(storedTasks);
        }
        
        if (storedCounter) {
            taskIdCounter = parseInt(storedCounter, 10);
        }
    } catch (error) {
        console.error('Erreur lors du chargement:', error);
        tasks = [];
        taskIdCounter = 0;
    }
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
    errorMessage.textContent = message;
    setTimeout(clearError, 3000);
}

/**
 * Clear error message
 */
function clearError() {
    errorMessage.textContent = '';
}