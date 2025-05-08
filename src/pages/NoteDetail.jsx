import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { FiArrowLeft, FiSave, FiTrash2 } from 'react-icons/fi';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import VoiceInput from '../components/voice/VoiceInput';
import './NoteDetail.css';

const NoteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General'
  });
  
  // Fetch note details
  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await axiosInstance.get(`/notes/${id}`);
        setNote(res.data.data);
        setFormData({
          title: res.data.data.title,
          content: res.data.data.content,
          category: res.data.data.category
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching note:', error);
        toast.error('Failed to load note');
        navigate('/notes');
      }
    };
    
    fetchNote();
  }, [id, navigate]);
  
  // Handle input change
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
  
  // Update note
  const updateNote = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      toast.error('Please provide title and content');
      return;
    }
    
    try {
      await axiosInstance.put(`/notes/${id}`, formData);
      toast.success('Note updated successfully');
      navigate('/notes');
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
    }
  };
  
  // Delete note
  const deleteNote = async () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await axiosInstance.delete(`/notes/${id}`);
        toast.success('Note deleted successfully');
        navigate('/notes');
      } catch (error) {
        console.error('Error deleting note:', error);
        toast.error('Failed to delete note');
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
    <div className="note-detail">
      <div className="page-header">
        <div className="header-left">
          <Link to="/notes" className="back-button">
            <FiArrowLeft />
            <span>Back to Notes</span>
          </Link>
          <h1>Edit Note</h1>
        </div>
        <div className="header-actions">
          <button className="btn btn-danger" onClick={deleteNote}>
            <FiTrash2 />
            <span>Delete</span>
          </button>
        </div>
      </div>
      
      <div className="note-meta">
        <div className="meta-item">
          <span className="meta-label">Created</span>
          <span className="meta-value">
            {format(new Date(note.createdAt), 'MMM d, yyyy h:mm a')}
          </span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Updated</span>
          <span className="meta-value">
            {format(new Date(note.updatedAt), 'MMM d, yyyy h:mm a')}
          </span>
        </div>
      </div>
      
      <div className="edit-form-container">
        <VoiceInput onTextCapture={handleVoiceInput} />
        
        <form onSubmit={updateNote} className="edit-note-form">
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
              rows="12"
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
          
          <button type="submit" className="btn btn-primary save-button">
            <FiSave />
            <span>Save Changes</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default NoteDetail;