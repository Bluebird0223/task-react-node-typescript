import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { finalDecrypt } from '../utils/crypto';
import type { Student } from '../types/student';

interface StudentListProps {
    onEdit: (student: Student) => void;
    refreshTrigger: number;
    onLogout: () => void;
}

const StudentList: React.FC<StudentListProps> = ({ onEdit, refreshTrigger, onLogout }) => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStudents();
    }, [refreshTrigger]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/students');

            // Final decryption on frontend (remove first encryption layer) - async
            const decryptedStudents = await Promise.all(
                response.data.map(async (student: any) => ({
                    ...student,
                    fullName: await finalDecrypt(student.fullName),
                    email: await finalDecrypt(student.email),
                    phoneNumber: await finalDecrypt(student.phoneNumber),
                    dateOfBirth: await finalDecrypt(student.dateOfBirth),
                    gender: await finalDecrypt(student.gender),
                    address: await finalDecrypt(student.address),
                    courseEnrolled: await finalDecrypt(student.courseEnrolled)
                }))
            );

            setStudents(decryptedStudents);
        } catch (err) {
            setError('Failed to fetch students');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            try {
                await axios.delete(`http://localhost:5000/api/student/${id}`);
                fetchStudents();
            } catch (err) {
                setError('Failed to delete student');
                console.error(err);
            }
        }
    };

    if (loading) return <div className="loading">Loading students...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="student-list-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0 }}>Student Records</h2>
                <button onClick={onLogout} className="btn-danger">Logout</button>
            </div>
            <div className="table-responsive">
                <table className="student-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>DOB</th>
                            <th>Gender</th>
                            <th>Course</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student) => (
                            <tr key={student._id}>
                                <td>{student.fullName}</td>
                                <td>{student.email}</td>
                                <td>{student.phoneNumber}</td>
                                <td>{new Date(student.dateOfBirth).toLocaleDateString()}</td>
                                <td>{student.gender}</td>
                                <td>{student.courseEnrolled}</td>
                                <td>
                                    <button className="edit-btn" onClick={() => onEdit(student)}>
                                        Edit
                                    </button>
                                    <button className="delete-btn" onClick={() => handleDelete(student._id!)}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StudentList;