import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../../Pages/InputField/TableLayout'; // Import the reusable DataTable component
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { Button, Row, Col, Modal } from 'react-bootstrap';
import './CancelReq.css';
import baseURL from '../../../../Url/NodeBaseURL';
import Navbar from '../../../Pages/Navbar/Navbar';
import axios from 'axios';

const CancelReq = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]); // New state for orders
  const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalImage, setModalImage] = useState("");
  
     // Function to open image in modal
     const handleImageClick = (imageSrc) => {
      setModalImage(imageSrc);
      setIsModalOpen(true);
    };

  const handleCancelRequest = async (orderId, action) => {
    if (!window.confirm(`Are you sure you want to ${action.toLowerCase()} this cancellation request?`)) return;

    try {
      const response = await axios.put(`${baseURL}/api/orders/cancel/handle/${orderId}`, { action });

      if (response.status === 200) {
        alert(`Order cancellation ${action.toLowerCase()} successfully.`);
        // Update UI by removing the request from the list
        setOrders((prevOrders) => prevOrders.filter(order => order.id !== orderId));
      }
      fetchData();
    } catch (error) {
      console.error(`Error updating order cancellation:`, error);
      alert("Failed to process cancellation request. Please try again.");
    }
};


  const columns = React.useMemo(
    () => [
      {
        Header: 'Sr. No.',
        Cell: ({ row }) => row.index + 1, // Generate a sequential number based on the row index
      },
      {
        Header: 'Date',
        accessor: row => {
          const date = new Date(row.date);
          return date.toLocaleDateString('en-GB'); // Formats as dd/mm/yyyy
        },
      },
      {
        Header: 'Mobile',
        accessor: 'mobile',
      },
      {
        Header: 'Customer',
        accessor: 'account_name',
      },
      {
        Header: 'Order No.',
        accessor: 'order_number',
      },

      {
        Header: 'Metal',
        accessor: 'metal',
      },
      {
        Header: 'Category',
        accessor: 'category',
      },
      {
        Header: 'Sub Category',
        accessor: 'subcategory',
      },
      {
        Header: 'Total Amt ',
        accessor: 'total_price',
      },
      {
        Header: 'Order Status',
        accessor: 'order_status',
      },
      {
        Header: "Image",
        accessor: "image_url",
        Cell: ({ value }) =>
          value ? (
            <img
              src={`${baseURL}${value}`}
              alt="Order Image"
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "5px",
                objectFit: "cover",
                cursor: "pointer",
              }}
              onClick={() => handleImageClick(`${baseURL}${value}`)}
            />
          ) : (
            "No Image"
          ),
      },
      {
        Header: 'Cancel Request Status',
        accessor: 'cancel_req_status',
      },
      { 
        Header: 'Action', 
        Cell: ({ row }) => (
          <>
            <button 
              onClick={() => handleCancelRequest(row.original.id, "Approved")} 
              className="cancel-req-approve-button"
            >
              Approve
            </button>
            <button 
              onClick={() => handleCancelRequest(row.original.id, "Rejected")} 
              className="cancel-req-reject-button"
            >
              Reject
            </button>
          </>
        )
      },
    ],
    []
  );

  
    const fetchData = async () => {
      try {
        const response = await fetch(`${baseURL}/api/orders`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();

        // Filter orders where order_status is "Cancelled"
        const cancelReqOrders = result.filter(order => order.cancel_req_status === "Pending");

        setData(cancelReqOrders); // Set only cancelled orders
        console.log("Cancel Req Orders:", cancelReqOrders);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    useEffect(() => {

    fetchData();
  }, [baseURL]);


  return (
    <>
      <Navbar />
      <div className="main-container">
        <div className="customers-table-container">
          <Row className="mb-3">
            <Col className="d-flex justify-content-between align-items-center">
              <h3>Cancel Requested Orders</h3>
            </Col>
          </Row>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <DataTable columns={columns} data={[...data].reverse()} />
          )}
        </div>
      </div>
      <Modal show={isModalOpen} onHide={() => setIsModalOpen(false)} centered>
              <Modal.Header closeButton>
                <Modal.Title>Image Preview</Modal.Title>
              </Modal.Header>
              <Modal.Body className="d-flex justify-content-center">
                <img
                  src={modalImage}
                  alt="Enlarged Order"
                  style={{ maxWidth: "100%", maxHeight: "80vh", borderRadius: "10px" }}
                />
              </Modal.Body>
            </Modal>
    </>
  );
};

export default CancelReq;
