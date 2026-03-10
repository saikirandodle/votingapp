import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Tabs, Tab } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function AdminPanel() {
  const [citizen, setCitizen] = useState({
    firstName: '',
    lastName: '',
    mobileNo: '',
    wardNo: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [party, setParty] = useState({
    name: '',
    candidateName: '',
    photo: '',
    details: ''
  });
  const navigate = useNavigate();
  const [parties, setParties] = useState([]);
  const [citizens, setCitizens] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      const response = await fetch('http://localhost:5000/admin/results');
      const data = await response.json();
      setParties(data);
    };

    const fetchCitizens = async () => {
      const response = await fetch('http://localhost:5000/admin/citizens');
      const data = await response.json();
      setCitizens(data);
    };

    fetchResults();
    fetchCitizens();
  }, []);

  const handleCitizenChange = (e) => {
    setCitizen({ ...citizen, [e.target.name]: e.target.value });
  };

  const handlePartyChange = (e) => {
    setParty({ ...party, [e.target.name]: e.target.value });
  };

  const handleCitizenPhotoChange = (e) => {
    setCitizen({ ...citizen, photo: e.target.files[0] });
  };

  const addCitizen = async () => {
    const formData = new FormData();
    Object.keys(citizen).forEach((key) => {
      formData.append(key, citizen[key]);
    });

    const response = await fetch('http://localhost:5000/admin/add-citizen', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    alert(data.message);
  };

  const addParty = async () => {
    const response = await fetch('http://localhost:5000/admin/add-party', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(party)
    });
    const data = await response.json();
    alert(data.message);
  };

  const handleLogout = () => {
    // Clear any admin session data if stored
    alert('Logged out successfully');
    navigate('/'); // Redirect to login page
  };

  const handleEditCitizen = (citizen) => {
    setCitizen(citizen);
    setIsEditing(true); // Set editing mode to true
  };

  const handleUpdateCitizen = async () => {
    const formData = new FormData();
    Object.keys(citizen).forEach((key) => {
      formData.append(key, citizen[key]);
    });

    const response = await fetch(`http://localhost:5000/admin/citizens/${citizen._id}`, {
      method: 'PUT',
      body: formData,
    });
    const data = await response.json();
    alert(data.message);

    // Refresh the citizens list
    const updatedResponse = await fetch('http://localhost:5000/admin/citizens');
    const updatedCitizens = await updatedResponse.json();
    setCitizens(updatedCitizens);

    // Reset form and exit editing mode
    setCitizen({
      firstName: '',
      lastName: '',
      mobileNo: '',
      wardNo: '',
      address: '',
      city: '',
      state: '',
      pincode: ''
    });
    setIsEditing(false);
  };

  const handleDeleteCitizen = async (id) => {
    if (window.confirm('Are you sure you want to delete this citizen?')) {
      const response = await fetch(`http://localhost:5000/admin/citizens/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      alert(data.message);
      setCitizens(citizens.filter((citizen) => citizen._id !== id));
    }
  };

  const handleEditParty = (party) => {
    // Populate the party form with the selected party's data for editing
    setParty(party);
  };

  const handleDeleteParty = async (id) => {
    if (window.confirm('Are you sure you want to delete this party?')) {
      const response = await fetch(`http://localhost:5000/admin/parties/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      alert(data.message);
      setParties(parties.filter((party) => party._id !== id));
    }
  };

  const handleAddCitizen = async () => {
    await addCitizen();
    const response = await fetch('http://localhost:5000/admin/citizens');
    const updatedCitizens = await response.json();
    setCitizens(updatedCitizens);
  };

  return (
    <Container>
      <h1 className="text-center my-4">Admin Panel</h1>
      <Button variant="danger" className="mb-3" onClick={handleLogout}>
        Logout
      </Button>
      <Tabs defaultActiveKey="citizens" id="admin-tabs" className="mb-3">
        <Tab eventKey="citizens" title="Citizens">
          <div>
            <h3>Manage Citizens</h3>
            <Form className="row mb-4">
              <Form.Group className="col-md-6">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  name="firstName"
                  placeholder="First Name"
                  value={citizen.firstName}
                  onChange={handleCitizenChange}
                />
              </Form.Group>
              <Form.Group className="col-md-6">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  name="lastName"
                  placeholder="Last Name"
                  value={citizen.lastName}
                  onChange={handleCitizenChange}
                />
              </Form.Group>
              <Form.Group className="col-md-6">
                <Form.Label>Mobile No</Form.Label>
                <Form.Control
                  name="mobileNo"
                  placeholder="Mobile No"
                  value={citizen.mobileNo}
                  onChange={handleCitizenChange}
                />
              </Form.Group>
              <Form.Group className="col-md-6">
                <Form.Label>Ward No</Form.Label>
                <Form.Control
                  name="wardNo"
                  placeholder="Ward No"
                  value={citizen.wardNo}
                  onChange={handleCitizenChange}
                />
              </Form.Group>
              <Form.Group className="col-md-6">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  name="address"
                  placeholder="Address"
                  value={citizen.address}
                  onChange={handleCitizenChange}
                />
              </Form.Group>
              <Form.Group className="col-md-6">
                <Form.Label>City</Form.Label>
                <Form.Control
                  name="city"
                  placeholder="City"
                  value={citizen.city}
                  onChange={handleCitizenChange}
                />
              </Form.Group>
              <Form.Group className="col-md-6">
                <Form.Label>State</Form.Label>
                <Form.Control
                  name="state"
                  placeholder="State"
                  value={citizen.state}
                  onChange={handleCitizenChange}
                />
              </Form.Group>
              <Form.Group className="col-md-6">
                <Form.Label>Pincode</Form.Label>
                <Form.Control
                  name="pincode"
                  placeholder="Pincode"
                  value={citizen.pincode}
                  onChange={handleCitizenChange}
                />
              </Form.Group>
              <Form.Group className="col-md-6">
                <Form.Label>Photo</Form.Label>
                <Form.Control
                  type="file"
                  name="photo"
                  onChange={handleCitizenPhotoChange}
                />
              </Form.Group>
            </Form>

            <Button
              variant={isEditing ? "success" : "primary"}
              onClick={isEditing ? handleUpdateCitizen : handleAddCitizen}
              className="mt-3"
            >
              {isEditing ? "Update Citizen" : "Add Citizen"}
            </Button>

            <h3>Existing Citizens</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Mobile No</th>
                  <th>Ward No</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {citizens.map((citizen) => (
                  <tr key={citizen._id}>
                    <td>{citizen.firstName}</td>
                    <td>{citizen.lastName}</td>
                    <td>{citizen.mobileNo}</td>
                    <td>{citizen.wardNo}</td>
                    <td>
                      <Button
                        variant="warning"
                        onClick={() => handleEditCitizen(citizen)}
                      >
                        Edit
                      </Button>{' '}
                      <Button
                        variant="danger"
                        onClick={() => handleDeleteCitizen(citizen._id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Tab>

        <Tab eventKey="addParty" title="Add Party">
          <Form>
            <Form.Group>
              <Form.Label>Party Name</Form.Label>
              <Form.Control name="name" placeholder="Party Name" onChange={handlePartyChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Candidate Name</Form.Label>
              <Form.Control name="candidateName" placeholder="Candidate Name" onChange={handlePartyChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Photo URL</Form.Label>
              <Form.Control name="photo" placeholder="Photo URL" onChange={handlePartyChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Details</Form.Label>
              <Form.Control name="details" placeholder="Details" onChange={handlePartyChange} />
            </Form.Group>
            <Button className="mt-3" onClick={addParty}>Add Party</Button>
          </Form>
        </Tab>

        <Tab eventKey="viewResults" title="View Results">
          <div>
            <h3>Party Results</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Party Name</th>
                  <th>Candidate Name</th>
                  <th>Photo</th>
                  <th>Details</th>
                  <th>Votes</th>
                </tr>
              </thead>
              <tbody>
                {parties.map((party) => (
                  <tr key={party._id}>
                    <td>{party.name}</td>
                    <td>{party.candidateName}</td>
                    <td>
                      <img
                        src={party.photo}
                        alt={party.candidateName}
                        style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                      />
                    </td>
                    <td>{party.details}</td>
                    <td>{party.votes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Tab>

        <Tab eventKey="manageParties" title="Manage Parties">
          <div>
            <h3>Manage Parties</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Party Name</th>
                  <th>Candidate Name</th>
                  <th>Photo</th>
                  <th>Details</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {parties.map((party) => (
                  <tr key={party._id}>
                    <td>{party.name}</td>
                    <td>{party.candidateName}</td>
                    <td>
                      <img
                        src={party.photo}
                        alt={party.candidateName}
                        style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                      />
                    </td>
                    <td>{party.details}</td>
                    <td>
                      <Button
                        variant="warning"
                        onClick={() => handleEditParty(party)}
                      >
                        Edit
                      </Button>{' '}
                      <Button
                        variant="danger"
                        onClick={() => handleDeleteParty(party._id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Tab>
      </Tabs>
    </Container>
  );
}

export default AdminPanel;