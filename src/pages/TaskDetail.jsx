import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft, FiSave, FiTrash2, FiCheck } from 'react-icons/fi';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import VoiceInput from '../components/voice/VoiceInput';
import './TaskDetail.css';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    completed: false
  });
  
  // Fetch task details
  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/tasks/${id}`);
        setTask(res.data.data);
        
        // Format date for input field
        let formattedDueDate = '';
        if (res.data.data.dueDate) {
          const dueDate = new Date(res.data.data.dueDate);
          formattedDueDate = format(dueDate, 'yyyy-MM-dd');
        }
        
        setFormData({
          title: res.data.data.title,
          description: res.data.data.description || '',
          priority: res.data.data.priority,
          dueDate: formattedDueDate,
          completed: res.data.data.completed
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching task:', error);
        toast.error('Failed to load task');
        navigate('/tasks');
      }
    };
    
    fetchTask();
  }, [id, navigate]);
  
  // Handle input change
  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };
  
  // Handle voice input
  const handleVoiceInput = (text) => {
    // Try to extract task details from voice input
    let title = '';
    let description = text;
    
    // Simple heuristic: first sentence is title, rest is description
    const firstPeriodIndex = text.indexOf('.');
    if (firstPeriodIndex > 0) {
      title = text.substring(0, firstPeriodIndex).trim();
      description = text.substring(firstPeriodIndex + 1).trim();
      
      setFormData({
        ...formData,
        title,
        description
      });
    } else {
      // If no period, use the whole text as either title or description
      // depending on what's already filled
      if (!formData.title) {
        setFormData({
          ...formData,
          title: text
        });
      } else {
        setFormData({
          ...formData,
          description: text
        });
      }
    }
  };
  
  // Update task
  const updateTask = async (e) => {
    e.preventDefault();
    
    if (!formData.title) {
      toast.error('Please provide a task title');
      return;
    }
    
    try {
      await axios.put(`http://localhost:5000/api/tasks/${id}`, formData);
      toast.success('Task updated successfully');
      navigate('/tasks');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };
  
  // Toggle task completion
  const toggleTaskCompletion = () => {
    setFormData({
      ...formData,
      completed: !formData.completed
    });
  };
  
  // Delete task
  const deleteTask = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axios.delete(`http://localhost:5000/api/tasks/${id}`);
        toast.success('Task deleted successfully');
        navigate('/tasks');
      } catch (error) {
        console.error('Error deleting task:', error);
        toast.error('Failed to delete task');
      }
    }
  };
  
  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }
  
  return (
    <div className="task-detail">
      <div className="page-header">
        <div className="header-left">
          <Link to="/tasks" className="back-button">
            <FiArrowLeft />
            <span>Back to Tasks</span>
          </Link>
          <h1>Edit Task</h1>
        </div>
        <div className="header-actions">
          <button 
            className={`btn ${formData.completed ? 'btn-success' : 'btn-secondary'}`}
            onClick={toggleTaskCompletion}
          >
            <FiCheck />
            <span>{formData.completed ? 'Completed' : 'Mark Complete'}</span>
          </button>
          <button className="btn btn-danger" onClick={deleteTask}>
            <FiTrash2 />
            <span>Delete</span>
          </button>
        </div>
      </div>
      
      <div className="task-meta">
        <div className="meta-item">
          <span className="meta-label">Created</span>
          <span className="meta-value">
            {format(new Date(task.createdAt), 'MMM d, yyyy h:mm a')}
          </span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Updated</span>
          <span className="meta-value">
            {format(new Date(task.updatedAt), 'MMM d, yyyy h:mm a')}
          </span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Status</span>
          <span className={`status-badge ${formData.completed ? 'completed' : 'pending'}`}>
            {formData.completed ? 'Completed' : 'Pending'}
          </span>
        </div>
      </div>
      
      <div className="edit-form-container">
        <VoiceInput onTextCapture={handleVoiceInput} />
        
        <form onSubmit={updateTask} className="edit-task-form">
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
              rows="6"
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
          
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="completed"
                checked={formData.completed}
                onChange={handleChange}
              />
              <span>Mark as completed</span>
            </label>
          </div>
          
          <button type="submit" className="btn btn-primary save-button">
            <FiSave />
            <span>Save Changes</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default TaskDetail;