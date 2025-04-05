// import React from 'react'
// import './OnholdOrders.css'
// const OnholdOrders = () => {
//   return (
//     <div className='worker-onhold-order-container'>OnholdOrders</div>
//   )
// }

// export default OnholdOrders

import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../../Pages/InputField/DataTable';
import { Row, Col, Modal } from 'react-bootstrap';
import './OnholdOrders.css';
import axios from "axios";
import baseURL from '../../../../Url/NodeBaseURL';
import WorkerNavbar from '../../../Pages/Navbar/WorkerNavbar';
import { AuthContext } from "../../../AuthContext/ContextApi";

const OnholdOrders = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalImage, setModalImage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Function to open image in modal
  const handleImageClick = (imageSrc) => {
    setModalImage(imageSrc);
    setIsModalOpen(true);
  };

  const columns = React.useMemo(
    () => [
      { Header: 'Sr. No.', Cell: ({ row }) => row.index + 1 },
      {
        Header: 'Order Date',
        accessor: row => {
          const date = new Date(row.date);
          return date.toLocaleDateString('en-GB'); // Formats as dd/mm/yyyy
        },
      },
      {
        Header: 'Delivery Date',
        accessor: row => {
          const date = new Date(row.delivery_date);
          return date.toLocaleDateString('en-GB'); // Formats as dd/mm/yyyy
        },
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
        Header: 'Purity',
        accessor: 'purity',
      },
      {
        Header: 'Gross Wt',
        accessor: 'gross_weight',
      },
      {
        Header: 'Stone Wt',
        accessor: 'stone_weight',
      },
      {
        Header: 'Total Wt',
        accessor: 'total_weight_aw',
      },
      { Header: 'Order Status', accessor: 'order_status', Cell: ({ row }) => row.original.order_status || 'N/A' },
      {
        Header: 'Work Status',
        accessor: 'work_status',
        Cell: ({ row }) => (
          <span style={{ color: row.original.work_status === 'Hold' ? 'Orange' : 'black' }}>
            {row.original.work_status || 'N/A'}
          </span>
        ),
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
    ],
    []
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/orders`);
        if (response.status !== 200) {
          throw new Error('Failed to fetch data');
        }
        const result = response.data;

        // Filter orders where work_status is "In Progress"
        const filteredData = result.filter(order => order.worker_id === user?.id && order.work_status === "Hold");

        setData(filteredData);
        console.log("Filtered Orders =", filteredData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  return (
    <>
      <WorkerNavbar />
      <div className="main-container">
        <div className="customers-table-container">
          <Row className="mb-3">
            <Col className="d-flex justify-content-between align-items-center">
              <h3>On Hold Orders</h3>
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

export default OnholdOrders;