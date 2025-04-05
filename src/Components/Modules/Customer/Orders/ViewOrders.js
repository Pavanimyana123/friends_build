import React, { useEffect, useState, useContext } from 'react';
import { Row, Col } from 'react-bootstrap';
import CustomerNavbar from '../../../Pages/Navbar/CustomerNavbar';
import { AuthContext } from "../../../AuthContext/ContextApi";
import baseURL from '../../../../Url/NodeBaseURL';
import './ViewOrders.css';
import axios from 'axios';
import ModalPopup from '../Design/Modalpopup';

const ViewOrders = () => {
  const { user } = useContext(AuthContext);
  console.log("user=", user?.id)
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [designRequests, setDesignRequests] = useState();
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleShowModal = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };




  const orderStatusSteps = ["Placed",
    "Processing",
    "Ready for Delivery",
    //  "Dispatched", 
    "Shipped",
    //  "Out for Delivery", 
    "Delivered",
    // "Cancel Requested"
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${baseURL}/api/orders`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();
        const filteredData = result.filter(order => order.account_id === user?.id);
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
  }, [baseURL, user]);

  useEffect(() => {
    const fetchDesignRequests = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/designs`);
        setDesignRequests(response.data);
        console.log("designs", response.data)
      } catch (error) {
        console.error("Error fetching design requests:", error);
      }
    };

    fetchDesignRequests();
  });

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to request cancellation for this order?")) return;

    try {
      const response = await axios.put(`${baseURL}/api/orders/cancel/${orderId}`);

      if (response.status === 200) {
        alert("Order cancel request sent successfully.");
        // Update UI by setting cancel_req_status to "Pending"
        setData((prevOrders) =>
          prevOrders.map(order =>
            order.id === orderId ? { ...order, cancel_req_status: "Pending" } : order
          )
        );
      }
    } catch (error) {
      console.error("Error requesting order cancellation:", error);
      alert("Failed to request order cancellation. Please try again.");
    }
  };

  // Extend the search filtering to include status, order date, gross weight, and purity.
  const filteredOrders = data.filter(order => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    const formattedDate = new Date(order.date).toLocaleDateString();
    return (
      order.order_number?.toString().toLowerCase().includes(lowerSearchTerm) ||
      order.product_design_name?.toLowerCase().includes(lowerSearchTerm) ||
      order.subcategory?.toLowerCase().includes(lowerSearchTerm) ||
      order.order_status?.toLowerCase().includes(lowerSearchTerm) ||
      formattedDate.toLowerCase().includes(lowerSearchTerm) ||
      order.gross_weight?.toString().toLowerCase().includes(lowerSearchTerm) ||
      order.purity?.toLowerCase().includes(lowerSearchTerm)
    );
  });


  const handleImageClick = (order) => {
    if (order.image_url) {
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>Order Image</title>
            </head>
            <body style="margin:0; display:flex; justify-content:center; align-items:center; height:100vh;">
              <img src="${baseURL}${order.image_url}" alt="Order Image" style="width: auto; height: auto; max-width: 90vw; max-height: 90vh;" />
            </body>
          </html>
        `);
        newWindow.document.close();
      }
    }
  };

  return (
    <>
      <CustomerNavbar />
      <div className="main-container">
        <h2 className="order-title">My Orders</h2>
        <div className="search-bar-container">
          <input
            type="text"
            placeholder="Search Orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-bar"
          />
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="orders-container">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order, index) => (
                <div className="order-card" key={index}>
                  <div className="order-header">
                    <span><strong>Order ID:</strong> <span>{order.order_number}</span></span>
                    {/* <span><strong>Total Amount:</strong> <span>₹{order.total_price}</span></span> */}
                    <span>
                      <strong>Status:</strong>
                      <span>
                        {order.cancel_req_status === "Pending"
                          ? "Cancel Requested"
                          : order.cancel_req_status === "Rejected"
                            ? "Cancel Rejected"
                            : order.order_status}
                      </span>
                    </span>
                    <span><strong>Worker Status:</strong> <span>{order.work_status}</span></span>
                    <span><strong>Order Date:</strong> <span>{new Date(order.date).toLocaleDateString()}</span></span>

                    <div className="order-actions">
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="cancel-button"
                        disabled={order.cancel_req_status === "Pending" || order.cancel_req_status === "Rejected" || order.order_status === "Canceled"}
                      >
                        {order.cancel_req_status === "Pending"
                          ? "Cancel Requested"
                          : order.cancel_req_status === "Rejected"
                            ? "Cancel Rejected"
                            : order.order_status === "Canceled"
                              ? "Order Canceled"
                              : "Cancel Order"}
                      </button>

                      <button
                        className="cancel-button"
                        onClick={() => handleShowModal(order)}
                        disabled={(designRequests ?? []).some(
                          (design) => design.order_id === order.id && ["Requested", "Approved", "Rejected"].includes(design.approve_status)
                        )}
                        style={{
                          backgroundColor: (designRequests ?? []).some((design) => design.order_id === order.id)
                            ? designRequests.find((design) => design.order_id === order.id)?.approve_status === "Requested"
                              ? "orange"
                              : designRequests.find((design) => design.order_id === order.id)?.approve_status === "Approved"
                                ? "green"
                                : "red"
                            : "rgb(62, 115, 247)",
                        }}
                      >
                        {(designRequests ?? []).some((design) => design.order_id === order.id) ? (
                          designRequests.find((design) => design.order_id === order.id)?.approve_status === "Requested"
                            ? "Design Requested"
                            : designRequests.find((design) => design.order_id === order.id)?.approve_status === "Approved"
                              ? "Approved"
                              : "Rejected"
                        ) : (
                          "Design Request"
                        )}
                      </button>
                    </div>

                  </div>

                  <hr />
                  <div className="order-body">
                    <div className="order-content">
                      <img
                        src={order.image_url ? `${baseURL}${order.image_url}` : 'default-image.jpg'}
                        alt="Product"
                        className="product-image"
                        // style={{ width: 'auto', height: '70px', borderRadius: '5px', objectFit: 'cover', cursor: 'pointer' }}
                        onClick={() => handleImageClick(order)}
                      />
                      <div className="product-details">
                        <p><strong>Product Name:</strong> <span>{order.subcategory}</span></p>
                        <p><strong>Design Name:</strong> <span>{order.product_design_name}</span></p>
                        <p><strong>Gross Wt:</strong> <span>{order.gross_weight}</span></p>
                        <p><strong>Purity:</strong> <span>{order.purity}</span></p>
                        <p><strong>Quantity:</strong> <span>{order.qty}</span></p>
                        <p><strong>Total Price:</strong> <span>₹{order.total_price}</span></p>
                      </div>

                    </div>
                    <div className="order-tracker">
                      {orderStatusSteps.map((step, idx) => (
                        <div
                          key={idx}
                          className={`tracker-step ${(order.cancel_req_status === "Pending" && step === "Cancel Requested") ||
                            (order.cancel_req_status !== "Pending" && step === order.order_status)
                            ? 'statusactive'
                            : ''
                            }`}
                        >
                          <p>{step.replace('_', ' ')}</p>
                          <div className="circle"></div>
                        </div>
                      ))}
                    </div>


                  </div>

                </div>
              ))
            ) : (
              <div>No orders found.</div>
            )}
          </div>
        )}
        <ModalPopup
          show={showModal}
          handleClose={handleCloseModal}
          order={selectedOrder}
        />
      </div>
    </>
  );
};

export default ViewOrders;
