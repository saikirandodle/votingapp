import React, { useState, useEffect } from 'react';
import { Container, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function CitizenPanel() {
  const [parties, setParties] = useState([]);
  const [selectedParty, setSelectedParty] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchParties = async () => {
      const response = await fetch('http://localhost:5000/admin/results');
      const data = await response.json();
      setParties(data);
    };

    fetchParties();
  }, []);

  const vote = async () => {
    if (!selectedParty) {
      alert('Please select a party to vote for.');
      return;
    }

    const response = await fetch('http://localhost:5000/citizen/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partyName: selectedParty }) // Send partyName instead of partyId
    });
    const data = await response.json();

    if (response.ok) {
      alert(data.message);
    } else {
      alert(data.error || 'Failed to cast vote.');
    }
  };

  const logout = async () => {
    const response = await fetch('http://localhost:5000/citizen/logout', {
      method: 'POST',
    });
    const data = await response.json();

    if (response.ok) {
      alert(data.message);
      navigate('/'); // Redirect to the home page after logout
    } else {
      alert(data.error || 'Failed to logout.');
    }
  };

  return (
    <Container>
      <h1 className="text-center my-4">Citizen Panel</h1>
      <h2>Vote for a Party</h2>
      <Form>
        {parties.map((party) => (
          <Form.Check
            key={party._id}
            type="radio"
            name="party"
            label={`${party.name} - ${party.candidateName}`}
            value={party.name} // Set the value to the party name
            onChange={(e) => setSelectedParty(e.target.value)}
          />
        ))}
        <Button className="mt-3" onClick={vote}>Vote</Button>
      </Form>
      <Button className="mt-3" variant="danger" onClick={logout}>Logout</Button>
    </Container>
  );
}

export default CitizenPanel;