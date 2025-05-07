import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { FiFileText, FiCheckSquare, FiPlusCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalNotes: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0
  });
  
  const [recentNotes, setRecentNotes] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch notes
        const notesRes = await axios.get('http://localhost:5000/api/notes');
        const notes = notesRes.data.data;
        
        // Fetch tasks
        const tasksRes = await axios.get('http://localhost:5000/api/tasks');
        const tasks = tasksRes.data.data;
        
        // Calculate stats
        const completedTasks = tasks.filter(task => task.completed).length;
        
        setStats({
          totalNotes: notes.length,
          totalTasks: tasks.length,
          completedTasks,
          pendingTasks: tasks.length - completedTasks
        });
        
        // Set recent notes and tasks (limited to 3)
        setRecentNotes(notes.slice(0, 3));
        setRecentTasks(tasks.slice(0, 3));
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }
  
  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>
      
      <motion.div 
        className="stats-grid"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="stat-card">
          <div className="stat-icon note-icon">
            <FiFileText size={24} />
          </div>
          <div className="stat-content">
            <h2>{stats.totalNotes}</h2>
            <p>Total Notes</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon task-icon">
            <FiCheckSquare size={24} />
          </div>
          <div className="stat-content">
            <h2>{stats.totalTasks}</h2>
            <p>Total Tasks</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon completed-icon">
            <FiCheckSquare size={24} />
          </div>
          <div className="stat-content">
            <h2>{stats.completedTasks}</h2>
            <p>Completed Tasks</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon pending-icon">
            <FiCheckSquare size={24} />
          </div>
          <div className="stat-content">
            <h2>{stats.pendingTasks}</h2>
            <p>Pending Tasks</p>
          </div>
        </div>
      </motion.div>
      
      <div className="dashboard-sections">
        <motion.div 
          className="dashboard-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="section-header">
            <h2>Recent Notes</h2>
            <Link to="/notes" className="view-all">View All</Link>
          </div>
          
          {recentNotes.length > 0 ? (
            <div className="cards-container">
              {recentNotes.map(note => (
                <Link to={`/notes/${note._id}`} key={note._id} className="note-card">
                  <h3>{note.title}</h3>
                  <p className="note-excerpt">
                    {note.content.length > 100 
                      ? `${note.content.substring(0, 100)}...` 
                      : note.content}
                  </p>
                  <span className="note-date">
                    {format(new Date(note.createdAt), 'MMM d, yyyy')}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No notes yet</p>
              <Link to="/notes" className="create-button">
                <FiPlusCircle />
                <span>Create Note</span>
              </Link>
            </div>
          )}
        </motion.div>
        
        <motion.div 
          className="dashboard-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="section-header">
            <h2>Recent Tasks</h2>
            <Link to="/tasks" className="view-all">View All</Link>
          </div>
          
          {recentTasks.length > 0 ? (
            <div className="cards-container">
              {recentTasks.map(task => (
                <Link to={`/tasks/${task._id}`} key={task._id} className="task-card">
                  <div className="task-header">
                    <h3>{task.title}</h3>
                    <span className={`badge badge-${task.priority}`}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                  </div>
                  <p className="task-excerpt">
                    {task.description && (task.description.length > 80 
                      ? `${task.description.substring(0, 80)}...` 
                      : task.description)}
                  </p>
                  <div className="task-footer">
                    <span className={`task-status ${task.completed ? 'completed' : 'pending'}`}>
                      {task.completed ? 'Completed' : 'Pending'}
                    </span>
                    {task.dueDate && (
                      <span className="task-date">
                        Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No tasks yet</p>
              <Link to="/tasks" className="create-button">
                <FiPlusCircle />
                <span>Create Task</span>
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;