import Note from '../models/noteModel.js';

// @desc    Get all notes for a user
// @route   GET /api/notes
// @access  Private
export const getNotes = async (req, res, next) => {
  try {
    const notes = await Note.find({ user: req.user.id }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: notes.length,
      data: notes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single note
// @route   GET /api/notes/:id
// @access  Private
export const getNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }
    
    // Make sure user owns the note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this note'
      });
    }
    
    res.status(200).json({
      success: true,
      data: note
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new note
// @route   POST /api/notes
// @access  Private
export const createNote = async (req, res, next) => {
  try {
    // Add user to request body
    req.body.user = req.user.id;
    
    const note = await Note.create(req.body);
    
    res.status(201).json({
      success: true,
      data: note
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update note
// @route   PUT /api/notes/:id
// @access  Private
export const updateNote = async (req, res, next) => {
  try {
    let note = await Note.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }
    
    // Make sure user owns the note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this note'
      });
    }
    
    note = await Note.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: note
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete note
// @route   DELETE /api/notes/:id
// @access  Private
export const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }
    
    // Make sure user owns the note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this note'
      });
    }
    
    await note.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};