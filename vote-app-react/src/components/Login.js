import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button } from 'react-bootstrap';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  const login = async () => {
    const response = await fetch('http://localhost:5000/citizen/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, isAdmin })
    });

    const data = await response.json();

    if (response.ok) {
      if (isAdmin) {
        alert('Admin login successful.');
        navigate('/admin');
      } else {
        if (data.changePassword) {
          alert('Password change required. Redirecting to change password page.');
          navigate('/change-password', { state: { username } });
        } else {
          alert('Citizen login successful. Redirecting to voting page.');
          navigate('/citizen');
        }
      }
    } else {
      alert(data.error || 'Login failed.');
    }
  };

  return (
    <Container>
      <h1 className="text-center my-4">Login</h1>
      <Form>
        <Form.Group>
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mt-3">
          <Form.Check
            type="checkbox"
            label="Login as Admin"
            checked={isAdmin}
            onChange={(e) => setIsAdmin(e.target.checked)}
          />
        </Form.Group>
        <Button className="mt-3" onClick={login}>Login</Button>
      </Form>
    </Container>
  );
}

export default Login;