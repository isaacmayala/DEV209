import React, { useState, useEffect } from 'react';

// Cookie utility functions
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
    document.cookie = `${name}=; expires=Tues, 01 Jan 2030 00:00:00 GMT; path=/`;
  }
};

// Notification Component
const Notification = ({ message, type, isVisible }) => {
  if (!isVisible) return null;
  
  return (
    <div className={`notification show ${type}`}>
      {message}
    </div>
  );
};

// Authentication Component
const AuthForms = ({ onLogin, onRegister }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({ username: '', password: '' });

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    onLogin(loginData.username, loginData.password);
    setLoginData({ username: '', password: '' });
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    onRegister(registerData.username, registerData.password);
    setRegisterData({ username: '', password: '' });
  };

  return (
    <div className="auth-forms">
      {isLoginMode ? (
        <div className="auth-section">
          <h2>Login</h2>
          <div className="auth-form">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={loginData.username}
                onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                required
              />
            </div>
            <button type="button" onClick={handleLoginSubmit}>Login</button>
          </div>
          <p>Don't have an account? <button className="link-btn" onClick={() => setIsLoginMode(false)}>Register here</button></p>
        </div>
      ) : (
        <div className="auth-section">
          <h2>Register</h2>
          <div className="auth-form">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={registerData.username}
                onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={registerData.password}
                onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                required
              />
            </div>
            <button type="button" onClick={handleRegisterSubmit}>Register</button>
          </div>
          <p>Already have an account? <button className="link-btn" onClick={() => setIsLoginMode(true)}>Login here</button></p>
        </div>
      )}
    </div>
  );
};

// Todo Item Component
const TodoItem = ({ todo, onToggle, onEdit, onDelete }) => {
  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <div className="todo-info">
        <div className="todo-title">{todo.title}</div>
        <div className="todo-description">{todo.description || 'No description'}</div>
      </div>
      <div className="todo-actions">
        <button className="btn-toggle" onClick={() => onToggle(todo.id)}>
          {todo.completed ? 'Mark Incomplete' : 'Mark Complete'}
        </button>
        <button className="btn-edit" onClick={() => onEdit(todo)}>Edit</button>
        <button className="btn-delete" onClick={() => onDelete(todo.id)}>Delete</button>
      </div>
    </div>
  );
};

// Todo List Component
const TodoList = ({ todos, onToggle, onEdit, onDelete }) => {
  if (todos.length === 0) {
    return (
      <div className="empty-todos">
        <p>No todos yet. Add one above!</p>
      </div>
    );
  }

  return (
    <div className="todos-list">
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

// Add Todo Form Component
const AddTodoForm = ({ onAddTodo }) => {
  const [todoData, setTodoData] = useState({ title: '', description: '' });

  const handleSubmit = () => {
    if (todoData.title.trim()) {
      onAddTodo(todoData.title, todoData.description);
      setTodoData({ title: '', description: '' });
    }
  };

  return (
    <div className="add-todo-section">
      <h2>Add New Todo</h2>
      <div className="todo-form">
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            value={todoData.title}
            onChange={(e) => setTodoData({...todoData, title: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            value={todoData.description}
            onChange={(e) => setTodoData({...todoData, description: e.target.value})}
            rows="3"
          />
        </div>
        <button type="button" onClick={handleSubmit}>Add Todo</button>
      </div>
    </div>
  );
};

// Edit Todo Modal Component
const EditTodoModal = ({ todo, isOpen, onClose, onSave }) => {
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    completed: false
  });

  useEffect(() => {
    if (todo) {
      setEditData({
        title: todo.title,
        description: todo.description,
        completed: todo.completed
      });
    }
  }, [todo]);

  const handleSubmit = () => {
    if (editData.title.trim()) {
      onSave(todo.id, editData.title, editData.description, editData.completed);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal" style={{ display: 'flex' }}>
      <div className="modal-content">
        <span className="close-modal" onClick={onClose}>&times;</span>
        <h2>Edit Todo</h2>
        <div className="edit-form">
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={editData.title}
              onChange={(e) => setEditData({...editData, title: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={editData.description}
              onChange={(e) => setEditData({...editData, description: e.target.value})}
              rows="3"
            />
          </div>
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={editData.completed}
                onChange={(e) => setEditData({...editData, completed: e.target.checked})}
              />
              Completed
            </label>
          </div>
          <button type="button" onClick={handleSubmit}>Save Changes</button>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const TodoApp = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [todos, setTodos] = useState([]);
  const [editingTodo, setEditingTodo] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '', isVisible: false });

  // Load user from cookies on component mount
  useEffect(() => {
    const storedUsername = Cookies.get('username');
    const storedToken = Cookies.get('authToken');
    if (storedUsername && storedToken) {
      setCurrentUser(storedUsername);
      loadMockTodos();
    }
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type, isVisible: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, isVisible: false }));
    }, 3000);
  };

  const loadMockTodos = () => {
    setTodos([
      { id: 1, title: 'Learn React', description: 'Understand components, state, and props', completed: true },
      { id: 2, title: 'Refactor Todo App', description: 'Convert vanilla JS to React components', completed: false },
      { id: 3, title: 'Style with CSS', description: 'Apply responsive design and modern styling', completed: false }
    ]);
  };

  const handleLogin = (username, password) => {
    if (username && password) {
      const mockToken = 'mock-token-' + Date.now();
      Cookies.set('authToken', mockToken);
      Cookies.set('username', username);
      setCurrentUser(username);
      loadMockTodos();
      showNotification('Login successful!', 'success');
    } else {
      showNotification('Invalid credentials.', 'error');
    }
  };

  const handleRegister = (username, password) => {
    if (username && password) {
      const mockToken = 'mock-token-' + Date.now();
      Cookies.set('authToken', mockToken);
      Cookies.set('username', username);
      setCurrentUser(username);
      setTodos([]);
      showNotification('Registration successful!', 'success');
    } else {
      showNotification('Registration failed.', 'error');
    }
  };

  const handleLogout = () => {
    Cookies.remove('authToken');
    Cookies.remove('username');
    setCurrentUser(null);
    setTodos([]);
    showNotification('Logged out successfully');
  };

  const handleAddTodo = (title, description) => {
    const newTodo = {
      id: todos.length > 0 ? Math.max(...todos.map(t => t.id)) + 1 : 1,
      title,
      description,
      completed: false
    };
    setTodos([...todos, newTodo]);
    showNotification('Todo added successfully!');
  };

  const handleToggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
    showNotification('Todo updated successfully!');
  };

  const handleDeleteTodo = (id) => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      setTodos(todos.filter(todo => todo.id !== id));
      showNotification('Todo deleted successfully!');
    }
  };

  const handleEditTodo = (todo) => {
    setEditingTodo(todo);
    setIsEditModalOpen(true);
  };

  const handleSaveEditedTodo = (id, title, description, completed) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, title, description, completed } : todo
    ));
    setIsEditModalOpen(false);
    setEditingTodo(null);
    showNotification('Todo updated successfully!');
  };

  return (
    <div className="container">
      <header className="app-header">
        <h1>Todo List App</h1>
        <div className="auth-status">
          <span className="username-display">
            {currentUser && `Welcome, ${currentUser}!`}
          </span>
          {currentUser && (
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </header>

      {!currentUser ? (
        <AuthForms onLogin={handleLogin} onRegister={handleRegister} />
      ) : (
        <div className="todo-container">
          <AddTodoForm onAddTodo={handleAddTodo} />
          <div className="todo-list-section">
            <h2>Your Todos</h2>
            <TodoList
              todos={todos}
              onToggle={handleToggleTodo}
              onEdit={handleEditTodo}
              onDelete={handleDeleteTodo}
            />
          </div>
          <EditTodoModal
            todo={editingTodo}
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSave={handleSaveEditedTodo}
          />
        </div>
      )}

      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
      />

   
    </div>
  );
};

export default TodoApp;
