import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminPanel from './components/AdminPanel';
import CitizenPanel from './components/CitizenPanel';
import Login from './components/Login';
import ChangePassword from './components/ChangePassword';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/citizen" element={<CitizenPanel />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
