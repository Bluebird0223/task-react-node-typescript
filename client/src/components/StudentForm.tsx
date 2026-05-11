import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { doubleEncryptForBackend } from '../utils/crypto';
import type { Student } from '../types/student';
import '../App.css';

interface StudentFormProps {
    student?: Student | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const StudentForm: React.FC<StudentFormProps> = ({ student, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState<Student>({
        fullName: '',
        email: '',
        phoneNumber: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        courseEnrolled: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (student) {
            setFormData(student);
        }
    }, [student]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Apply first level encryption on frontend (async)
            const encryptedData: any = {
                fullName: await doubleEncryptForBackend(formData.fullName),
                email: await doubleEncryptForBackend(formData.email),
                phoneNumber: await doubleEncryptForBackend(formData.phoneNumber),
                dateOfBirth: await doubleEncryptForBackend(formData.dateOfBirth),
                gender: await doubleEncryptForBackend(formData.gender),
                address: await doubleEncryptForBackend(formData.address),
                courseEnrolled: await doubleEncryptForBackend(formData.courseEnrolled),
            };

            if (formData.password) {
                encryptedData.password = await doubleEncryptForBackend(formData.password);
            }

            const token = localStorage.getItem('token');
            let response;
            if (student?._id) {
                response = await axios.put(`http://localhost:5000/api/student/${student._id}`, encryptedData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                response = await axios.post('http://localhost:5000/api/register', encryptedData);
            }

            if (response.status === 200 || response.status === 201) {
                onSuccess();
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="student-form-container">
            <div className="student-form-wrapper">
                <h2>{student ? 'Update Student' : 'Register New Student'}</h2>
                <form onSubmit={handleSubmit}>
                    {/* Form fields remain same */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Full Name *</label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Date of Birth</label>
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Gender</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Address</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows={3}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Course Enrolled *</label>
                                <input
                                    type="text"
                                    name="courseEnrolled"
                                    value={formData.courseEnrolled}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Password *</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required={!student}
                                    placeholder={student ? "Leave blank to keep current password" : "Enter password"}
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="form-actions">
                        <button type="submit" disabled={loading}>
                            {loading ? 'Processing...' : (student ? 'Update' : 'Register')}
                        </button>
                        <button type="button" onClick={onCancel}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StudentForm;