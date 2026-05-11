import React, { useState } from 'react';
import axios from 'axios';
import { frontendEncrypt } from '../utils/crypto';
import { useNavigate } from 'react-router-dom';

interface LoginFormProps {
    onLoginSuccess: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // First level encryption on frontend (async)
            const encryptedEmail = await frontendEncrypt(email);
            const encryptedPassword = await frontendEncrypt(password);

            const response = await axios.post('http://localhost:5000/api/login', {
                email: encryptedEmail,
                password: encryptedPassword
            });

            if (response.status === 200) {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('studentId', response.data.studentId);
                localStorage.setItem('token', response.data.token);
                onLoginSuccess();
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-form-wrapper">
                <h2>Student Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Enter your email"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Enter your password"
                        />
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <button type="submit" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <button type="button" onClick={() => navigate('/register')} className="btn-secondary" style={{marginTop: '10px', width: '100%'}}>Register</button>
            </div>
        </div>
    );
};

export default LoginForm;