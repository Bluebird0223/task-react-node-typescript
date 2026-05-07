import express from 'express';
import {
    createStudent,
    getStudents,
    updateStudent,
    deleteStudent,
    login
} from '../controllers/studentController';

const router = express.Router();

router.post('/register', createStudent);
router.post('/login', login);
router.get('/students', getStudents);
router.put('/student/:id', updateStudent);
router.delete('/student/:id', deleteStudent);

export default router;