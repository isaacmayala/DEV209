/**
 * Todo List Application
 * A front-end application for managing todos with user authentication
 */

// Configuration and Constants
const API_URL = 'http://localhost:3000';

// DOM Element References
// Auth related elements
const loginSection = document.getElementById('login-section');
const registerSection = document.getElementById('register-section');
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const logoutBtn = document.getElementById('logout-btn');
const usernameDisplay = document.getElementById('username-display');
const authForms = document.getElementById('auth-forms');
const todoContainer = document.getElementById('todo-container');
// Todo related elements
const addTodoForm = document.getElementById('add-todo-form');
const todosList = document.getElementById('todos-list');
const editModal = document.getElementById('edit-modal');
const closeModal = document.querySelector('.close-modal');
const editTodoForm = document.getElementById('edit-todo-form');
// Notification element
const notification = document.getElementById('notification');

// Application State
let currentUser = null;
let todos = [];

// Cookie Management Functions

/**
 * Sets a cookie with the given name, value and expiry days
 */
function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;`;
}

/**
 * Gets a cookie value by name
 */
function getCookie(name) {
    const cookieArr = document.cookie.split(';');
    for (let i = 0; i < cookieArr.length; i++) {
        const cookiePair = cookieArr[i].split('=');
        if (name === cookiePair[0].trim()) {
            return decodeURIComponent(cookiePair[1]);
        }
    }
    return null;
}

/**
 * Deletes a cookie by name
 */
function deleteCookie(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

// UI Utility Functions

/**
 * Shows a notification message to the user
 */
function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    setTimeout(() => {
        notification.className = 'notification';
    }, 3000);
}

/**
 * Toggles between login and register form sections
 */
function toggleAuthSections(section) {
    if (section === 'login') {
        loginSection.style.display = 'block';
        registerSection.style.display = 'none';
    } else {
        loginSection.style.display = 'none';
        registerSection.style.display = 'block';
    }
}

/**
 * Updates the UI after successful login
 */
function updateUIAfterLogin() {
    if (currentUser) {
        authForms.style.display = 'none';
        todoContainer.style.display = 'block';
        logoutBtn.style.display = 'block';
        usernameDisplay.textContent = currentUser.username;
    }
}

/**
 * Updates the UI after logout
 */
function updateUIAfterLogout() {
    authForms.style.display = 'block';
    todoContainer.style.display = 'none';
    logoutBtn.style.display = 'none';
    usernameDisplay.textContent = '';
    toggleAuthSections('login');
}

/**
 * Opens the edit modal with todo data
 */
function openEditModal(todoId) {
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;
    
    document.getElementById('edit-todo-id').value = todo.id;
    document.getElementById('edit-todo-title').value = todo.title;
    document.getElementById('edit-todo-description').value = todo.description || '';
    document.getElementById('edit-todo-completed').checked = todo.completed;
    editModal.style.display = 'block';
}

/**
 * Closes the edit modal
 */
function closeEditModal() {
    editModal.style.display = 'none';
}

/**
 * Renders the todo list in the UI
 */
function renderTodos() {
    todosList.innerHTML = '';
    
    if (todos.length === 0) {
        todosList.innerHTML = '<p>No todos yet. Add one above!</p>';
        return;
    }
    
    todos.forEach(todo => {
        const todoItem = document.createElement('div');
        todoItem.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        
        todoItem.innerHTML = ``;
      // Add event listeners to buttons
        const editBtn = todoItem.querySelector('.btn-edit');
        const deleteBtn = todoItem.querySelector('.btn-delete');
        const toggleBtn = todoItem.querySelector('.btn-toggle');
        
        editBtn.addEventListener('click', () => openEditModal(todo.id));
        deleteBtn.addEventListener('click', () => deleteTodo(todo.id));
        toggleBtn.addEventListener('click', () => toggleTodoStatus(todo.id));
        
        todosList.appendChild(todoItem);
    });
}

// API Functions

/**
 * Register a new user
 */
async function registerUser(username, password) {
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }
        
        showNotification('Registration successful! Please login.');
        toggleAuthSections('login');
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

/**
 * Login user
 */
async function loginUser(username, password) {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }
        
        // Store auth token in cookie
        setCookie('authToken', data.token, 7);
        
        // Set current user
        currentUser = {
            id: data.userId,
            username: username
        };
        
        // Update UI
        updateUIAfterLogin();
        
        // Fetch todos
        fetchTodos();
        
        showNotification('Login successful!');
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

/**
 * Logout user
 */
function logoutUser() {
    // Delete auth token cookie
    deleteCookie('authToken');
    
    // Reset application state
    currentUser = null;
    todos = [];
    
    // Update UI
    updateUIAfterLogout();
    
    showNotification('You have been logged out.');
}

/**
 * Fetch all todos for the current user
 */
async function fetchTodos() {
    try {
        const authToken = getCookie('authToken');
        if (!authToken) {
            throw new Error('Authentication required');
        }
        
        const response = await fetch(`${API_URL}/todos`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch todos');
        }
        
        todos = data;
        renderTodos();
    } catch (error) {
        showNotification(error.message, 'error');
        if (error.message === 'Authentication required') {
            logoutUser();
        }
    }
}

/**
 * Create a new todo
 */
async function createTodo(title, description) {
    try {
        const authToken = getCookie('authToken');
        if (!authToken) {
            throw new Error('Authentication required');
        }
        
        const response = await fetch(`${API_URL}/todos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                title,
                description,
                completed: false
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to create todo');
        }
        
        // Add the new todo to the list
        todos.push(data);
        
        // Update the UI
        renderTodos();
        
        showNotification('Todo created successfully!');
    } catch (error) {
        showNotification(error.message, 'error');
        if (error.message === 'Authentication required') {
            logoutUser();
        }
    }
}

/**
 * Update a todo
 */
async function updateTodo(id, updates) {
    try {
        const authToken = getCookie('authToken');
        if (!authToken) {
            throw new Error('Authentication required');
        }
        
        const response = await fetch(`${API_URL}/todos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(updates)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to update todo');
        }
        
        // Update the todo in the list
        const index = todos.findIndex(t => t.id === id);
        if (index !== -1) {
            todos[index] = { ...todos[index], ...updates };
        }
        
        // Update the UI
        renderTodos();
        
        showNotification('Todo updated successfully!');
    } catch (error) {
        showNotification(error.message, 'error');
        if (error.message === 'Authentication required') {
            logoutUser();
        }
    }
}

/**
 * Delete a todo
 */
async function deleteTodo(id) {
    try {
        const authToken = getCookie('authToken');
        if (!authToken) {
            throw new Error('Authentication required');
        }
        
        const response = await fetch(`${API_URL}/todos/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to delete todo');
        }
        
        // Remove the todo from the list
        todos = todos.filter(t => t.id !== id);
        
        // Update the UI
        renderTodos();
        
        showNotification('Todo deleted successfully!');
    } catch (error) {
        showNotification(error.message, 'error');
        if (error.message === 'Authentication required') {
            logoutUser();
        }
    }
}

/**
 * Toggle todo completion status
 */
async function toggleTodoStatus(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    
    await updateTodo(id, { completed: !todo.completed });
}

// Event Listeners

// Auth form toggle links
showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    toggleAuthSections('register');
});

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    toggleAuthSections('login');
});

// Login form submission
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    loginUser(username, password);
});

// Register form submission
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    registerUser(username, password);
});

// Logout button
logoutBtn.addEventListener('click', () => {
    logoutUser();
});

// Add todo form submission
addTodoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('todo-title').value;
    const description = document.getElementById('todo-description').value;
    createTodo(title, description);
    
    // Clear form fields
    document.getElementById('todo-title').value = '';
    document.getElementById('todo-description').value = '';
});

// Edit todo form submission
editTodoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-todo-id').value;
    const title = document.getElementById('edit-todo-title').value;
    const description = document.getElementById('edit-todo-description').value;
    const completed = document.getElementById('edit-todo-completed').checked;
    
    updateTodo(id, { title, description, completed });
    closeEditModal();
});

// Close modal button
closeModal.addEventListener('click', () => {
    closeEditModal();
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === editModal) {
        closeEditModal();
    }
});

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    const authToken = getCookie('authToken');
    if (authToken) {
        // Verify token and get user info
        fetch(`${API_URL}/verify-token`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.valid) {
                currentUser = {
                    id: data.userId,
                    username: data.username
                };
                updateUIAfterLogin();
                fetchTodos();
            } else {
                // Token is invalid or expired
                deleteCookie('authToken');
            }
        })
        .catch(() => {
            // Error verifying token, clear it
            deleteCookie('authToken');
        });
    }
});
