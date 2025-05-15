/**
Todo List Application
A front-end application for managing todos with user authentication
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

Sets a cookie with the given name, value and expiry days
*/
function setCookie(name, value, days) {
const expires = new Date();
expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
document.cookie = ${name}=${value};expires=${expires.toUTCString()};path=/;
}

/**

Gets a cookie value by name
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

Deletes a cookie by name
*/
function deleteCookie(name) {
document.cookie = ${name}=;expires=Thu, 01 Jan 2025 00:00:00 UTC;path=/;
}

// UI Utility Functions

/**

Shows a notification message to the user
*/
function showNotification(message, type = 'success') {
notification.textContent = message;
notification.className = notification ${type} show;
setTimeout(() => {
notification.className = 'notification';
}, 3000);
}

/**

Toggles between login and register form sections
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

Updates the UI after successful login
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

Updates the UI after logout
*/
function updateUIAfterLogout() {
authForms.style.display = 'block';
todoContainer.style.display = 'none';
logoutBtn.style.display = 'none';
usernameDisplay.textContent = '';
toggleAuthSections('login');
}

/**

Opens the edit modal with todo data
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

Closes the edit modal
*/
function closeEditModal() {
editModal.style.display = 'none';
}

/**

Renders the todo list in the UI
*/
function renderTodos() {
todosList.innerHTML = '';
if (todos.length === 0) {
todosList.innerHTML = '<p>No todos yet. Add one above!</p>';
return;
}
todos.forEach(todo => {
const todoItem = document.createElement('div');
todoItem.className = todo-item ${todo.completed ? 'completed' : ''};

