import express from 'express';
import { createEntry, getEntries, updateEntry, deleteEntry } from '../controllers/pushupController';
import { auth } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(auth);

router.post('/', createEntry);
router.get('/', getEntries);
router.put('/:id', updateEntry);
router.delete('/:id', deleteEntry);

export default router; 