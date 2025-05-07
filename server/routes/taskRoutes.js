import express from 'express';
import { 
  getTasks, 
  getTask, 
  createTask, 
  updateTask,
  toggleTaskStatus,
  deleteTask 
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);

router.route('/')
  .get(getTasks)
  .post(createTask);

router.route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(deleteTask);

router.route('/:id/toggle')
  .put(toggleTaskStatus);

export default router;