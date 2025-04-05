import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../../Pages/InputField/TableLayout"; // Reusable table component
import { Row, Col, Modal } from "react-bootstrap";
import Navbar from "../../../Pages/Navbar/Navbar";
import axios from "axios";
import baseURL from "../../../../Url/NodeBaseURL";

const DesignReq = () => {
  const navigate = useNavigate();
  const [designs, setDesigns] = useState([]);
  const [orders, setOrders] = useState([]);
  const [mergedData, setMergedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalImage, setModalImage] = useState("");

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/orders`);
      if (response.status === 200) {
        setOrders(response.data);
      } else {
        throw new Error("Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  // Fetch designs
  const fetchDesigns = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/designs`);
      if (response.status === 200) {
        setDesigns(response.data);
      } else {
        throw new Error("Failed to fetch designs");
      }
    } catch (error) {
      console.error("Error fetching designs:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchOrders();
      await fetchDesigns();
      setLoading(false);
    };

    fetchData();
  }, []);

  // Merge orders with designs
  useEffect(() => {
    if (orders.length > 0 && designs.length > 0) {
      const merged = designs
        .map((design) => {
          const order = orders.find((order) => order.id === design.order_id);
          return order
            ? { ...order, 
                approve_status: design.approve_status, 
                requested_design_name: design.requested_design_name,
                design_id: design.id // Store design_id for updating status
              }
            : null;
        })
        .filter((item) => item !== null); // Remove null values

      setMergedData(merged);
    }
  }, [orders, designs]);

  // Handle approve status change
  const handleApproveStatusChange = async (designId, newStatus) => {
    try {
      const response = await axios.put(`${baseURL}/api/designs/${designId}/approve-status`, {
        approve_status: newStatus,
      });

      if (response.status === 200) {
        setMergedData((prevData) =>
          prevData.map((item) =>
            item.design_id === designId ? { ...item, approve_status: newStatus } : item
          )
        );
        alert(`Design request status updated to ${newStatus}`);
      } else {
        throw new Error("Failed to update approve status");
      }
    } catch (error) {
      console.error("Error updating approve status:", error);
      alert("Failed to update status. Please try again.");
    }
  };

  // Define table columns
  const columns = React.useMemo(
    () => [
      {
        Header: "S No.",
        Cell: ({ row }) => row.index + 1,
      },
      {
        Header: "Date",
        accessor: (row) => new Date(row.date).toLocaleDateString("en-GB"),
      },
      {
        Header: "Customer",
        accessor: "account_name",
      },
      {
        Header: "Order No.",
        accessor: "order_number",
      },
      {
        Header: "Metal",
        accessor: "metal",
      },
      {
        Header: "Category",
        accessor: "category",
      },
      {
        Header: "Sub Category",
        accessor: "subcategory",
      },
      {
        Header: "Existing Design",
        accessor: "product_design_name",
      },
      {
        Header: "Requested Design",
        accessor: "requested_design_name",
      },
      {
        Header: "Total Amt",
        accessor: "total_price",
      },
      // {
      //   Header: "Order Status",
      //   accessor: "order_status",
      // },
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
        Header: "Approve Status",
        accessor: "approve_status",
        Cell: ({ row }) => (
          <select
            value={row.original.approve_status}
            onChange={(e) => handleApproveStatusChange(row.original.design_id, e.target.value)}
            disabled={row.original.approve_status === "Approved"} // Disable if already approved
          >
            <option value={row.original.approve_status}>{row.original.approve_status}</option>
            {row.original.approve_status !== "Approved" && <option value="Approved">Approved</option>}
            {row.original.approve_status !== "Rejected" && <option value="Rejected">Rejected</option>}
          </select>
        ),
      }      
    ],
    []
  );

  const handleImageClick = (imageSrc) => {
    setModalImage(imageSrc);
    setIsModalOpen(true);
  };

  return (
    <>
      <Navbar />
      <div className="main-container">
        <div className="customers-table-container">
          <Row className="mb-3">
            <Col className="d-flex justify-content-between align-items-center">
              <h3>Design Requested Orders</h3>
            </Col>
          </Row>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <DataTable columns={columns} data={mergedData} />
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

export default DesignReq;
