import express from 'express';
import {
    createStudent,
    getStudents,
    updateStudent,
    deleteStudent,
    login
} from '../controllers/studentController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', createStudent);
router.post('/login', login);
router.get('/students', authMiddleware, getStudents);
router.put('/student/:id', authMiddleware, updateStudent);
router.delete('/student/:id', authMiddleware, deleteStudent);

export default router;