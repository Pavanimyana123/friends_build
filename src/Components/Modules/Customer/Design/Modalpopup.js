import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import baseURL from '../../../../Url/NodeBaseURL';

const ModalPopup = ({ show, handleClose, order }) => {
  const [newDesign, setNewDesign] = useState(order?.product_design_name || '');

  const handleSave = async () => {
    if (!newDesign) {
      alert("Please enter a new design name");
      return;
    }

    const requestData = {
      order_id: order?.id,
      account_name: order?.account_name,
      requested_design_name: newDesign,
      approve_status: "Requested"
    };

    try {
      const response = await axios.post(`${baseURL}/api/designs`, requestData);
      alert(response.data.message);
      setNewDesign('');
      handleClose();
    } catch (error) {
      console.error("Error submitting design change request:", error);
      alert("Failed to submit the request");
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Change Design Request</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p><strong>Current Design:</strong> {order?.product_design_name}</p>
        {/* <p><strong>Order Id:</strong> {order?.id}</p>
        <p><strong>Customer Name:</strong> {order?.account_name}</p> */}
        <Form>
          <Form.Group>
            <Form.Label>New Design Name</Form.Label>
            <Form.Control
              type="text"
              value={newDesign}
              onChange={(e) => setNewDesign(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Close</Button>
        <Button variant="primary" onClick={handleSave}>Submit Request</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalPopup;
