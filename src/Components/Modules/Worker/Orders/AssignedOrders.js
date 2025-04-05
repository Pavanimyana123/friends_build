import React, { useEffect, useState, useContext } from 'react';
import { Row, Col, Modal } from 'react-bootstrap';
import DataTable from '../../../Pages/InputField/DataTable'; // Import the reusable DataTable component
import axios from "axios";
import baseURL from '../../../../Url/NodeBaseURL';
import WorkerNavbar from '../../../Pages/Navbar/WorkerNavbar';
import { AuthContext } from "../../../AuthContext/ContextApi";
import ModalPop from "../Comments/Modalpop"; // Import Modal
import './AssignedOrders.css';

const AssignedOrders = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpenImg, setIsModalOpenImg] = useState(false);
  const [currentRow, setCurrentRow] = useState(null);
  const [comment, setComment] = useState("");
  const [newWorkStatus, setNewWorkStatus] = useState("Pending"); // State to hold the new work status
  const [modalImage, setModalImage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
    // Function to open image in modal
    const handleImageClick = (imageSrc) => {
      setModalImage(imageSrc);
      setIsModalOpenImg(true);
    };

  const columns = React.useMemo(
    () => [
      {
        Header: 'Sr. No.',
        Cell: ({ row }) => row.index + 1, // Generate a sequential number based on the row index
      },
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

      {
        Header: "Assigned Status",
        accessor: "assigned_status",
        Cell: ({ row }) => {
          const [status, setStatus] = useState(row.original.assigned_status || "Assigned");

          const handleAssignStatusChange = async (event) => {
            const newStatus = event.target.value;
            setStatus(newStatus);

            try {
              const response = await axios.put(`${baseURL}/api/orders/assign-status/${row.original.id}`, {
                assigned_status: newStatus,
                worker_id: row.original.worker_id,
                worker_name: row.original.worker_name,
              });

              console.log("Work status updated:", response.data);
              alert("Work status updated successfully!");
              fetchData();
            } catch (error) {
              console.error("Error updating work status:", error);
              alert("Failed to update work status.");
            }
          };

          return (
            <select
              value={status}
              onChange={handleAssignStatusChange}
              disabled={status === "Accepted"}
            >
              <option value="Assigned">Assigned</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </select>
          );
        },
      },
      // {
      //   Header: "Work Status",
      //   accessor: "work_status",
      //   Cell: ({ row }) => {
      //     const [status, setStatus] = useState(row.original.work_status || "Pending");

      //     const handleStatusChange = (event) => {
      //       const newStatus = event.target.value;
      //       setNewWorkStatus(newStatus); // Set the new work status
      //       setCurrentRow(row.original); // Set the current row for modal
      //       setIsModalOpen(true); // Open the modal
      //     };

      //     return (
      //       <div>
      //         <select
      //           value={status}
      //           onChange={handleStatusChange}
      //           disabled={row.original.assigned_status !== "Accepted"}
      //           style={{
      //             opacity: row.original.assigned_status !== "Accepted" ? 0.6 : 1,
      //             cursor: row.original.assigned_status !== "Accepted" ? "not-allowed" : "pointer"
      //           }}
      //         >
      //           <option value="Pending">Pending</option>
      //           <option value="In Progress">In Progress</option>
      //           <option value="Completed">Completed</option>
      //           <option value="Hold">Hold</option>
      //         </select>
      //       </div>
      //     );
      //   },
      // },
      {
        Header: "Work Status",
        accessor: "work_status",
        Cell: ({ row }) => {
          const [status, setStatus] = useState(row.original.work_status || "Pending");

          const handleStatusChange = (event) => {
            const newStatus = event.target.value;
            setNewWorkStatus(newStatus); // Set the new work status
            setCurrentRow(row.original); // Set the current row for modal
            setIsModalOpen(true); // Open the modal
          };

          // Function to determine the text color based on status
          const getStatusColor = (status) => {
            switch (status) {
              case "Pending":
                return "red";
              case "Completed":
                return "green";
              case "In Progress":
              case "Hold":
                return "orange"; // Warning color
              default:
                return "black";
            }
          };

          return (
            <div>
              <select
                value={status}
                onChange={handleStatusChange}
                disabled={row.original.assigned_status !== "Accepted"}
                style={{
                  color: getStatusColor(status), // Apply dynamic color
                  opacity: row.original.assigned_status !== "Accepted" ? 0.6 : 1,
                  cursor: row.original.assigned_status !== "Accepted" ? "not-allowed" : "pointer",
                  fontWeight: "bold",
                }}
              >
                <option value="Pending" style={{ color: "red" }}>Pending</option>
                <option value="In Progress" style={{ color: "orange" }}>In Progress</option>
                <option value="Completed" style={{ color: "green" }}>Completed</option>
                <option value="Hold" style={{ color: "orange" }}>Hold</option>
              </select>
            </div>
          );
        },
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


  const fetchData = async () => {
    try {
      const response = await fetch(`${baseURL}/api/orders`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const result = await response.json();

      const filteredData = result.filter(order => order.worker_id === user?.id);
      setData(filteredData);
      console.log("Filtered Orders =", filteredData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const handleModalSubmit = async () => {
    if (!currentRow) return;

    try {
      const response = await axios.put(`${baseURL}/api/orders/work-status/${currentRow.id}`, {
        work_status: newWorkStatus, // Use the new work status selected by the user
        worker_id: currentRow.worker_id,
        worker_name: currentRow.worker_name,
        worker_comment: comment, // Send the comment
      });

      console.log("Work status updated:", response.data);
      window.location.reload();
      fetchData();
      alert("Work status updated successfully!");


    } catch (error) {
      console.error("Error updating work status:", error);
      alert("Failed to update work status.");
    } finally {
      setIsModalOpen(false);
      setComment(""); // Reset comment
      setCurrentRow(null); // Reset current row
      setNewWorkStatus("Pending"); // Reset new work status
    }
  };

  return (
    <>
      <WorkerNavbar />
      <div className="main-container">
        <div className="customers-table-container">
          <Row className="mb-3">
            <Col className="d-flex justify-content-between align-items-center">
              <h3>Assigned Orders</h3>
            </Col>
          </Row>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <DataTable columns={columns} data={[...data].reverse()} />
          )}
        </div>
      </div>
      <ModalPop
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        comment={comment}
        setComment={setComment}
      />
      <Modal show={isModalOpenImg} onHide={() => setIsModalOpenImg(false)} centered>
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

export default AssignedOrders;