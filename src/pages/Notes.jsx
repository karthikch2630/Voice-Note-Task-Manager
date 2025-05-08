import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { FiSearch, FiPlusCircle, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import VoiceInput from '../components/voice/VoiceInput';
import './Notes.css';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General'
  });
  
  // Fetch all notes
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/notes');
      setNotes(res.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to load notes');
      setLoading(false);
    }
  };
  
  // Delete a note
  const deleteNote = async (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await axiosInstance.delete(`/notes/${id}`);
        setNotes(notes.filter(note => note._id !== id));
        toast.success('Note deleted successfully');
      } catch (error) {
        console.error('Error deleting note:', error);
        toast.error('Failed to delete note');
      }
    }
  };
  
  // Filter notes based on search term
  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle input change for form
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  // Handle voice input
  const handleVoiceInput = (text) => {
    setFormData({
      ...formData,
      content: text
    });
  };
  
  // Create new note
  const createNote = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      toast.error('Please provide title and content');
      return;
    }
    
    try {
      const res = await axiosInstance.post('/notes', formData);
      setNotes([res.data.data, ...notes]);
      setFormData({
        title: '',
        content: '',
        category: 'General'
      });
      setShowCreateForm(false);
      toast.success('Note created successfully');
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error('Failed to create note');
    }
  };
  
  // Load notes on component mount
  useEffect(() => {
    fetchNotes();
  }, []);
  
  return (
    <div className="notes-page">
      <div className="page-header">
        <h1>My Notes</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          <FiPlusCircle />
          <span>{showCreateForm ? 'Cancel' : 'Create Note'}</span>
        </button>
      </div>
      
      <AnimatePresence>
        {showCreateForm && (
          <motion.div 
            className="create-note-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h2>Create New Note</h2>
            <p>Use voice or text to create your note</p>
            
            <VoiceInput onTextCapture={handleVoiceInput} />
            
            <form onSubmit={createNote}>
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter note title"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="content">Content</label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Enter note content or use voice input"
                ></textarea>
              </div>
              
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="General">General</option>
                  <option value="Work">Work</option>
                  <option value="Personal">Personal</option>
                  <option value="Ideas">Ideas</option>
                  <option value="To-Do">To-Do</option>
                </select>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Note
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="notes-controls">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {loading ? (
        <div className="loading">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <>
          {filteredNotes.length > 0 ? (
            <div className="notes-grid">
              {filteredNotes.map(note => (
                <motion.div 
                  key={note._id}
                  className="note-item"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="note-category">{note.category}</div>
                  <h3 className="note-title">{note.title}</h3>
                  <p className="note-content">
                    {note.content.length > 150 
                      ? `${note.content.substring(0, 150)}...` 
                      : note.content}
                  </p>
                  <div className="note-footer">
                    <span className="note-date">
                      {format(new Date(note.createdAt), 'MMM d, yyyy')}
                    </span>
                    <div className="note-actions">
                      <Link to={`/notes/${note._id}`} className="btn-icon">
                        <FiEdit2 />
                      </Link>
                      <button 
                        className="btn-icon delete" 
                        onClick={() => deleteNote(note._id)}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="empty-notes">
              <h3>No notes found</h3>
              <p>
                {searchTerm 
                  ? `No results for "${searchTerm}". Try a different search term.` 
                  : 'Create your first note to get started'}
              </p>
              {!searchTerm && (
                <button 
                  className="btn btn-primary" 
                  onClick={() => setShowCreateForm(true)}
                >
                  <FiPlusCircle />
                  <span>Create Note</span>
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Notes;