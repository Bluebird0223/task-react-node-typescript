import React, { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import StudentForm from './components/StudentForm';
import StudentList from './components/StudentList';
import type { Student } from './types/student';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [refreshList, setRefreshList] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn');
    if (loggedIn === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    navigate('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('studentId');
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setShowForm(false);
    setEditingStudent(null);
    navigate('/login');
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingStudent(null);
    setRefreshList(prev => prev + 1);
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingStudent(null);
    setShowForm(true);
  };

  const Dashboard = () => (
    <>
      <div className="main-content">
        {showForm && (
          <StudentForm
            student={editingStudent}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setShowForm(false);
              setEditingStudent(null);
            }}
          />
        )}

        <StudentList onEdit={handleEdit} refreshTrigger={refreshList} onLogout={handleLogout} />
      </div>
    </>
  );

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={!isLoggedIn ? <LoginForm onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/" replace />} />
        <Route path="/register" element={
          !isLoggedIn ? (
            <div className="login-container">
              <div style={{ width: '100%', maxWidth: '800px' }}>
                <StudentForm
                  onSuccess={() => navigate('/login')}
                  onCancel={() => navigate('/login')}
                />
              </div>
            </div>
          ) : <Navigate to="/" replace />
        } />
      </Routes>
    </div>
  );
};

export default App;