import { Request, Response } from 'express';
import Student, { IStudent } from '../models/Student';
import { backendDecrypt, backendEncrypt } from '../utils/crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Create new student
export const createStudent = async (req: Request, res: Response) => {
    try {
        const studentData = req.body;

        // Check if student already exists by decrypting backend layer
        const students = await Student.find();
        const existingStudent = students.find(s => {
            if (!s.email) return false;
            try {
                return backendDecrypt(s.email) === studentData.email;
            } catch (e) {
                return false;
            }
        });

        if (existingStudent) {
            return res.status(400).json({ message: 'Student already exists with this email' });
        }

        // Encrypt sensitive data with double encryption
        const encryptedStudent = {
            fullName: backendEncrypt(studentData.fullName),
            email: backendEncrypt(studentData.email),
            phoneNumber: backendEncrypt(studentData.phoneNumber),
            dateOfBirth: backendEncrypt(studentData.dateOfBirth),
            gender: backendEncrypt(studentData.gender),
            address: backendEncrypt(studentData.address),
            courseEnrolled: backendEncrypt(studentData.courseEnrolled),
            password: backendEncrypt(await bcrypt.hash(studentData.password, 10))
        };

        const student = new Student(encryptedStudent);
        await student.save();

        res.status(201).json({ message: 'Student created successfully', studentId: student._id });
    } catch (error) {
        console.error('Error creating student:', error);
        res.status(500).json({ message: 'Error creating student', error });
    }
};

// Get all students (partial decryption - backend decrypts second level)
export const getStudents = async (req: Request, res: Response) => {
    try {
        const students = await Student.find()
        // .select('-password');

        const partiallyDecryptedStudents = students.map(student => {
            const studentObj = student.toObject();
            return {
                ...studentObj,
                fullName: backendDecrypt(studentObj.fullName),
                email: backendDecrypt(studentObj.email),
                phoneNumber: backendDecrypt(studentObj.phoneNumber),
                dateOfBirth: backendDecrypt(studentObj.dateOfBirth),
                gender: backendDecrypt(studentObj.gender),
                address: backendDecrypt(studentObj.address),
                courseEnrolled: backendDecrypt(studentObj.courseEnrolled),
                // password: backendDecrypt(studentObj.password),
            };
        });

        res.status(200).json(partiallyDecryptedStudents);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Error fetching students', error });
    }
};

// Update student
export const updateStudent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Check email if already exists
        if (updateData.email) {
            const students = await Student.find();
            const existingStudent = students.find(s => {
                if (s._id.toString() === id) return false;
                if (!s.email) return false;
                try {
                    return backendDecrypt(s.email) === updateData.email;
                } catch (e) {
                    return false;
                }
            });

            if (existingStudent) {
                return res.status(400).json({ message: 'Student already exists with this email' });
            }
        }

        // Encrypt updated data
        const encryptedUpdate: any = {};
        const fieldsToEncrypt = ['fullName', 'email', 'phoneNumber', 'dateOfBirth', 'gender', 'address', 'courseEnrolled'];

        for (const field of fieldsToEncrypt) {
            if (updateData[field]) {
                encryptedUpdate[field] = backendEncrypt(updateData[field]);
            }
        }

        if (updateData.password) {
            encryptedUpdate.password = backendEncrypt(await bcrypt.hash(updateData.password, 10));
        }

        const student = await Student.findByIdAndUpdate(id, encryptedUpdate, { new: true });

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.status(200).json({ message: 'Student updated successfully' });
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ message: 'Error updating student', error });
    }
};

// Delete student
export const deleteStudent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const student = await Student.findByIdAndDelete(id);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.status(200).json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ message: 'Error deleting student', error });
    }
};

// Login validation
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const students = await Student.find();

        // Find student with matching email (partially decrypt to check)
        let foundStudent = null;
        for (const student of students) {
            const decryptedEmail = backendDecrypt(student.email);
            if (decryptedEmail === email) {
                foundStudent = student;
                break;
            }
        }

        if (!foundStudent) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Decrypt and verify password
        const decryptedPassword = backendDecrypt(foundStudent.password);
        const isValidPassword = await bcrypt.compare(password, decryptedPassword);

        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: foundStudent._id },
            process.env.JWT_SECRET || 'task-react-node-typescript-jwt-Secret',
            { expiresIn: '24h' }
        );

        res.status(200).json({ message: 'Login successful', studentId: foundStudent._id, token });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Error during login', error });
    }
};