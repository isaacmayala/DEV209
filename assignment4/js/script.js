/**
 * Todo List App - Front-end JavaScript
 */

// API Base URL - Update this to match your server address
const API_BASE_URL = 'http://localhost:3000';

// DOM Elements
const elements = {
    // Auth sections
    loginSection: document.getElementById('login-section'),
    registerSection: document.getElementById('register-section'),
    todoContainer: document.getElementById('todo-container'),
    authForms: document.getElementById('auth-forms'),
    
    // Auth UI elements
    usernameDisplay: document.getElementById('username-display'),
    logoutBtn: document.getElementById('logout-btn'),
    
    // Form elements
    loginForm: document.getElementById('login-form'),
    registerForm: document.getElementById('register-form'),
    addTodoForm: document.getElementById('add-todo-form'),
    editTodoForm: document.getElementById('edit-todo-form'),
    
    // Todo list container
    todosList: document.getElementById('todos-list'),
    
    // Modal elements
    editModal: document.getElementById('edit-modal'),
    closeModal: document.querySelector('.close-modal'),
    
    // Form inputs
    loginUsername: document.getElementById('login-username'),
    loginPassword: document.getElementById('login-password'),
    registerUsername: document.getElementById('register-username'),
    registerPassword: document.getElementById('register-password'),
    todoTitle: document.getElementById('todo-title'),
    todoDescription: document.getElementById('todo-description'),
    editTodoId: document.getElementById('edit-todo-id'),
    editTodoTitle: document.getElementById('edit-todo-title'),
    editTodoDescription: document.getElementById('edit-todo-description'),
    editTodoCompleted: document.getElementById('edit-todo-completed'),
    
    // Navigation
    showRegisterLink: document.getElementById('show-register'),
    showLoginLink: document.getElementById('show-login'),
    
    // Notification
    notification: document.getElementById('notification')
};

// ===== Utility Functions =====

// Cookie management
const Cookies = {
    set: (name, value, days = 7) => {
        const expires = new Date(Date.now() + days * 86400000).toUTCString();
        document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
    },
    
    get: (name) => {
        const cookies = document.cookie.split(';').map(cookie => cookie.trim());
        const cookie = cookies.find(cookie => cookie.startsWith(`${name}=`));
        return cookie ? decodeURIComponent(cookie.substring(name.length + 1)) : null;
    },
    
    remove: (name) => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
};

// Show notification
const showNotification = (message, type = 'success') => {
    elements.notification.textContent = message;
    elements.notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        elements.notification.classList.remove('show');
    }, 3000);
};

// API request helper
const apiRequest = async (endpoint, method = 'GET', data = null) => {
    const token = Cookies.get('authToken');
    
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    if (token) {
        options.headers.Authorization = `Bearer ${token}`;
    }
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'API request failed');
        }
        
        // For DELETE requests returning 204 No Content
        if (response.status === 204) {
            return true;
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        showNotification(error.message, 'error');
        throw error;
    }
};

// ===== Authentication Functions =====

// Register user
const registerUser = async (username, password) => {
    try {
        const data = await apiRequest('/register', 'POST', { username, password });
        
        // Save the auth token
        Cookies.set('authToken', data.token);
        Cookies.set('username', data.username);
        
        showNotification('Registration successful!');
        return data;
    } catch (error) {
        showNotification(`Registration failed: ${error.message}`, 'error');
        throw error;
    }
};

// Login user
const loginUser = async (username, password) => {
    try {
        const data = await apiRequest('/login', 'POST', { username, password });
        
        // Save the auth token
        Cookies.set('authToken', data.token);
        Cookies.set('username', data.username);
        
        showNotification('Login successful!');
        return data;
    } catch (error) {
        showNotification(`Login failed: ${error.message}`, 'error');
        throw error;
    }
};

// Logout user
const logoutUser = async () => {
    try {
        await apiRequest('/logout', 'POST');
        
        // Clear the auth token
        Cookies.remove('authToken');
        Cookies.remove('username');
        
        showNotification('Logged out successfully');
        showLoginForm();
    } catch (error) {
        showNotification(`Logout failed: ${error.message}`, 'error');
    }
};

// Check if user is logged in
const checkAuthStatus = () => {
    const token = Cookies.get('authToken');
    const username = Cookies.get('username');
    
    if (token && username) {
        elements.usernameDisplay.textContent = `Welcome, ${username}!`;
        elements.logoutBtn.style.display = 'block';
        showTodoContainer();
        fetchTodos();
        return true;
    } else {
        showLoginForm();
        return false;
    }
};

// ===== Todo CRUD Functions =====

// Fetch all todos
const fetchTodos = async () => {
    try {
        const todos = await apiRequest('/todos');
        renderTodoList(todos);
    } catch (error) {
        showNotification(`Error fetching todos: ${error.message}`, 'error');
    }
};

// Add a new todo
const addTodo = async (title, description) => {
    try {
        const newTodo = await apiRequest('/todos', 'POST', { title, description });
        showNotification('Todo added successfully!');
        fetchTodos(); // Refresh the list
        return newTodo;
    } catch (error) {
        showNotification(`Error adding todo: ${error.message}`, 'error');
        throw error;
    }
};

// Update a todo
const updateTodo = async (id, updates) => {
    try {
        const updatedTodo = await apiRequest(`/todos/${id}`, 'PUT', updates);
        showNotification('Todo updated successfully!');
        fetchTodos(); // Refresh the list
        return updatedTodo;
    } catch (error) {
        showNotification(`Error updating todo: ${error.message}`, 'error');
        throw error;
    }
};

// Delete a todo
const deleteTodo = async (id) => {
    try {
        await apiRequest(`/todos/${id}`, 'DELETE');
        showNotification('Todo deleted successfully!');
        fetchTodos(); // Refresh the list
    } catch (error) {
        showNotification(`Error deleting todo: ${error.message}`, 'error');
    }
};

// Toggle todo completion status
const toggleTodoStatus = async (id, completed) => {
    try {
        await updateTodo(id, { completed });
    } catch (error) {
        showNotification(`Error updating status: ${error.message}`, 'error');
    }
};

// ===== UI Functions =====

// Show login form
const showLoginForm = () => {
    elements.loginSection.style.display = 'block';
    elements.registerSection.style.display = 'none';
    elements.todoContainer.style.display = 'none';
    elements.authForms.style.display = 'block';
    elements.logoutBtn.style.display = 'none';
};

// Show register form
const showRegisterForm = () => {
    elements.loginSection.style.display = 'none';
    elements.registerSection.style.display = 'block';
    elements.todoContainer.style.display = 'none';
    elements.authForms.style.display = 'block';
};

// Show todo container
const showTodoContainer = () => {
    elements.authForms.style.display = 'none';
    elements.todoContainer.style.display = 'block';
};

// Render todo list
const renderTodoList = (todos) => {
    elements.todosList.innerHTML = '';
    
    if (todos.length === 0) {
        elements.todosList.innerHTML = '<p>No todos yet. Add one above!</p>';
        return;
    }
    
    todos.forEach(todo => {
        const todoElement = document.createElement('div');
        todoElement.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        todoElement.setAttribute('data-id', todo.id);
        
        todoElement.innerHTML = `
            <div class="todo-info">
                <div class="todo-title">${todo.title}</div>
                <div class="todo-description">${todo.description || 'No description'}</div>
            </div>
            <div class="todo-actions">
                <button class="btn-toggle">${todo.completed ? 'Mark Incomplete' : 'Mark Complete'}</button>
                <button class="btn-edit">Edit</button>
                <button class="btn-delete">Delete</button>
            </div>
        `;
        
        // Add event listeners for todo actions
        const toggleBtn = todoElement.querySelector('.btn-toggle');
        const editBtn = todoElement.querySelector('.btn-edit');
        const deleteBtn = todoElement.querySelector('.btn-delete');
        
        toggleBtn.addEventListener('click', () => {
            toggleTodoStatus(todo.id, !todo.completed);
        });
        
        editBtn.addEventListener('click', () => {
            showEditModal(todo);
        });
        
        deleteBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this todo?')) {
                deleteTodo(todo.id);
            }
        });
        
        elements.todosList.appendChild(todoElement);
    });
};

// Show edit modal
const showEditModal = (todo) => {
    elements.editTodoId.value = todo.id;
    elements.editTodoTitle.value = todo.title;
    elements.editTodoDescription.value = todo.description || '';
    elements.editTodoCompleted.checked = todo.completed;
    
    elements.editModal.style.display = 'block';
};

// Hide edit modal
const hideEditModal = () => {
    elements.editModal.style.display = 'none';
};

// ===== Event Listeners =====

// When DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    checkAuthStatus();
    
    // Switch between login and register forms
    elements.showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        showRegisterForm();
    });
    
    elements.showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        showLoginForm();
    });
    
    // Form submissions
    elements.registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = elements.registerUsername.value.trim();
        const password = elements.registerPassword.value;
        
        try {
            await registerUser(username, password);
            elements.registerForm.reset();
            checkAuthStatus();
        } catch (error) {
            console.error('Registration Error:', error);
        }
    });
    
    elements.loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = elements.loginUsername.value.trim();
        const password = elements.loginPassword.value;
        
        try {
            await loginUser(username, password);
            elements.loginForm.reset();
            checkAuthStatus();
        } catch (error) {
            console.error('Login Error:', error);
        }
    });
    
    elements.addTodoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const title = elements.todoTitle.value.trim();
        const description = elements.todoDescription.value.trim();
        
        try {
            await addTodo(title, description);
            elements.addTodoForm.reset();
        } catch (error) {
            console.error('Add Todo Error:', error);
        }
    });
    
    elements.editTodoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = elements.editTodoId.value;
        const title = elements.editTodoTitle.value.trim();
        const description = elements.editTodoDescription.value.trim();
        const completed = elements.editTodoCompleted.checked;
        
        try {
            await updateTodo(id, { title, description, completed });
            hideEditModal();
        } catch (error) {
            console.error('Edit Todo Error:', error);
        }
    });
    
    // Logout button
    elements.logoutBtn.addEventListener('click', logoutUser);
    
    // Close modal
    elements.closeModal.addEventListener('click', hideEditModal);
    window.addEventListener('click', (e) => {
        if (e.target === elements.editModal) {
            hideEditModal();
        }
    });
});
