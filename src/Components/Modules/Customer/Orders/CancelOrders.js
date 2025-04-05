import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../../Pages/InputField/TableLayout"; // Import DataTable component
import { Row, Col, Modal } from "react-bootstrap";
import "./ViewOrders.css";
import baseURL from "../../../../Url/NodeBaseURL";
import CustomerNavbar from "../../../Pages/Navbar/CustomerNavbar";
import { AuthContext } from "../../../AuthContext/ContextApi";

const CancelOrders = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState("");

  // Function to open the image in a popup modal
  const handleImageClick = (imageSrc) => {
    setModalImage(imageSrc);
    setIsModalOpen(true);
  };

  const columns = React.useMemo(
    () => [
      {
        Header: "Sr. No.",
        Cell: ({ row }) => row.index + 1,
      },
      {
        Header: "Date",
        accessor: (row) => new Date(row.date).toLocaleDateString("en-GB"),
      },
      {
        Header: "Mobile",
        accessor: "mobile",
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
        Header: "Purity",
        accessor: "purity",
      },
      {
        Header: "Gross Wt",
        accessor: "gross_weight",
      },
      {
        Header: "Stone Wt",
        accessor: "stone_weight",
      },
      {
        Header: "Total Wt",
        accessor: "total_weight_aw",
      },
      {
        Header: "Total Amt",
        accessor: "total_price",
      },
      {
        Header: "Order Status",
        accessor: "order_status",
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
              onError={(e) => (e.target.src = "/placeholder.png")}
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
        const response = await fetch(`${baseURL}/api/orders`); 
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await response.json();

        // Filter only cancelled orders
        const cancelledOrders = result.filter((order) => order.account_id === user?.id && order.order_status === "Canceled");
        // const filteredData = result.filter(order => order.worker_id === user?.id && order.work_status === "In Progress");

        setData(cancelledOrders.reverse()); // Reverse to show latest orders first
        console.log("Cancelled Orders:", cancelledOrders);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <CustomerNavbar />
      <div className="main-container">
        <div className="customers-table-container">
          <Row className="mb-3">
            <Col className="d-flex justify-content-between align-items-center">
              <h3>Cancel Orders</h3>
            </Col>
          </Row>

          {loading ? (
            <div>Loading...</div>
          ) : (
            <DataTable columns={columns} data={data} />
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
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

export default CancelOrders;
