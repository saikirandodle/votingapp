import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Form, Button } from 'react-bootstrap';

function ChangePassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');

  const handleChangePassword = async () => {
    const response = await fetch('http://localhost:5000/citizen/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: location.state.username,
        oldPassword,
        newPassword
      })
    });

    const data = await response.json();

    if (response.ok) {
      alert(data.message);
      navigate('/'); // Redirect to login page after password change
    } else {
      alert(data.error || 'Failed to change password.');
    }
  };

  return (
    <Container>
      <h1 className="text-center my-4">Change Password</h1>
      <Form>
        <Form.Group>
          <Form.Label>Old Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter old password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>New Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </Form.Group>
        <Button className="mt-3" onClick={handleChangePassword}>Change Password</Button>
      </Form>
    </Container>
  );
}

export default ChangePassword;