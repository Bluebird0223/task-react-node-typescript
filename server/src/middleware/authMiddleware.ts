import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Student from '../models/Student';

export interface AuthRequest extends Request {
    studentId?: string;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authorization token required' });
        }

        const token = authHeader.split(' ')[1];
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'task-react-node-typescript-jwt-Secret');

        // Check if student still exists in the database
        const studentExists = await Student.findById(decoded.id);
        if (!studentExists) {
            return res.status(401).json({ message: 'Account has been deleted or does not exist.' });
        }

        req.studentId = decoded.id;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};
