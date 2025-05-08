import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { FiSearch, FiPlusCircle, FiEdit2, FiCheck, FiTrash2, FiFilter } from 'react-icons/fi';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import VoiceInput from '../components/voice/VoiceInput';
import './Tasks.css';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all'
  });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: ''
  });
  
  // Fetch all tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/tasks');
      setTasks(res.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
      setLoading(false);
    }
  };
  
  // Toggle task completion status
  const toggleTaskStatus = async (id, currentStatus) => {
    try {
      const res = await axiosInstance.put(`/tasks/${id}/toggle`);
      // Update task in state
      setTasks(tasks.map(task => 
        task._id === id ? res.data.data : task
      ));
      toast.success(`Task marked as ${currentStatus ? 'pending' : 'completed'}`);
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
    }
  };
  
  // Delete a task
  const deleteTask = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axiosInstance.delete(`/tasks/${id}`);
        setTasks(tasks.filter(task => task._id !== id));
        toast.success('Task deleted successfully');
      } catch (error) {
        console.error('Error deleting task:', error);
        toast.error('Failed to delete task');
      }
    }
  };
  
  // Filter and search tasks
  const filteredTasks = tasks.filter(task => {
    // Filter by status
    if (filters.status === 'completed' && !task.completed) return false;
    if (filters.status === 'pending' && task.completed) return false;
    
    // Filter by priority
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
    
    // Search by title or description
    return (
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });
  
  // Handle input change for form
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  // Handle voice input
  const handleVoiceInput = (text) => {
    // Try to extract task title from voice input
    let title = '';
    let description = text;
    
    // Simple heuristic: first sentence is title, rest is description
    const firstPeriodIndex = text.indexOf('.');
    if (firstPeriodIndex > 0) {
      title = text.substring(0, firstPeriodIndex).trim();
      description = text.substring(firstPeriodIndex + 1).trim();
    } else {
      title = text;
      description = '';
    }
    
    setFormData({
      ...formData,
      title: title,
      description: description
    });
  };
  
  // Handle filter change
  const handleFilterChange = (filterType, value) => {
    setFilters({
      ...filters,
      [filterType]: value
    });
  };
  
  // Create new task
  const createTask = async (e) => {
    e.preventDefault();
    
    if (!formData.title) {
      toast.error('Please provide a task title');
      return;
    }
    
    try {
      const res = await axiosInstance.post('/tasks', formData);
      setTasks([res.data.data, ...tasks]);
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: ''
      });
      setShowCreateForm(false);
      toast.success('Task created successfully');
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };
  
  // Load tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);
  
  return (
    <div className="tasks-page">
      <div className="page-header">
        <h1>My Tasks</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          <FiPlusCircle />
          <span>{showCreateForm ? 'Cancel' : 'Create Task'}</span>
        </button>
      </div>
      
      <AnimatePresence>
        {showCreateForm && (
          <motion.div 
            className="create-task-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h2>Create New Task</h2>
            <p>Use voice or text to create your task</p>
            
            <VoiceInput onTextCapture={handleVoiceInput} />
            
            <form onSubmit={createTask}>
              <div className="form-group">
                <label htmlFor="title">Task Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter task title"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description (Optional)</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Enter task description or use voice input"
                ></textarea>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="priority">Priority</label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="dueDate">Due Date (Optional)</label>
                  <input
                    type="date"
                    id="dueDate"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Task
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="tasks-controls">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-controls">
          <div className="filter-group">
            <FiFilter />
            <select 
              value={filters.status} 
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          
          <div className="filter-group">
            <select 
              value={filters.priority} 
              onChange={(e) => handleFilterChange('priority', e.target.value)}
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="loading">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <>
          {filteredTasks.length > 0 ? (
            <div className="tasks-list">
              {filteredTasks.map(task => (
                <motion.div 
                  key={task._id}
                  className={`task-item ${task.completed ? 'completed' : ''}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="task-checkbox">
                    <button 
                      className={`checkbox ${task.completed ? 'checked' : ''}`}
                      onClick={() => toggleTaskStatus(task._id, task.completed)}
                    >
                      {task.completed && <FiCheck />}
                    </button>
                  </div>
                  
                  <div className="task-content">
                    <div className="task-header">
                      <h3 className="task-title">{task.title}</h3>
                      <span className={`badge badge-${task.priority}`}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                    </div>
                    
                    {task.description && (
                      <p className="task-description">{task.description}</p>
                    )}
                    
                    <div className="task-footer">
                      {task.dueDate && (
                        <span className="task-due-date">
                          Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                        </span>
                      )}
                      <span className="task-date">
                        Created: {format(new Date(task.createdAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="task-actions">
                    <Link to={`/tasks/${task._id}`} className="btn-icon">
                      <FiEdit2 />
                    </Link>
                    <button 
                      className="btn-icon delete" 
                      onClick={() => deleteTask(task._id)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="empty-tasks">
              <h3>No tasks found</h3>
              <p>
                {searchTerm || filters.status !== 'all' || filters.priority !== 'all'
                  ? 'No tasks match your current filters. Try adjusting your search or filters.'
                  : 'Create your first task to get started'}
              </p>
              {!searchTerm && filters.status === 'all' && filters.priority === 'all' && (
                <button 
                  className="btn btn-primary" 
                  onClick={() => setShowCreateForm(true)}
                >
                  <FiPlusCircle />
                  <span>Create Task</span>
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Tasks;