import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../../Pages/InputField/DataTable';
import { Button, Row, Col, Modal } from 'react-bootstrap';
import './ViewOrders.css';
import axios from "axios";
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import baseURL from '../../../../Url/NodeBaseURL';
import Navbar from '../../../Pages/Navbar/Navbar';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable"; // ✅ Ensure this is installed and imported
import * as XLSX from 'xlsx';
import { pdf } from "@react-pdf/renderer";
import TaxINVoiceReceipt from "./TaxInvoiceA4";
import EstimateReceipt from './EstimateReceipt';
import { saveAs } from "file-saver";

const ViewOrders = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workers, setWorkers] = useState([]);
  const [assignedWorkers, setAssignedWorkers] = useState({});
  const [orders, setOrders] = useState([]);
  const [selectedData, setSelectedData] = useState([]); // Store selected row details
  const [filteredData, setFilteredData] = useState([]); // New state for filtered data
  const [selectedRows, setSelectedRows] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState("");

  const handleImageClick = (imageSrc) => {
    setModalImage(imageSrc);
    setIsModalOpen(true);
  };

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const response = await fetch(`${baseURL}/accounts`);
        if (!response.ok) {
          throw new Error('Failed to fetch workers');
        }
        const result = await response.json();
        const workers = result
          .filter((item) => item.account_group === 'WORKER')
          .map((item) => ({
            id: item.id,
            account_name: item.account_name,
          }));
        setWorkers(workers);
      } catch (error) {
        console.error('Error fetching workers:', error);
      }
    };
    fetchWorkers();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(`${baseURL}/api/orders`);
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateOrderWithWorker = async (orderId, workerId, workerName) => {
    try {
      const response = await fetch(`${baseURL}/api/orders/assign/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assigned_status: workerId ? 'Assigned' : 'Not Assigned',
          worker_id: workerId,
          worker_name: workerName,
          work_status: 'Pending',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order');
      }
      // Update UI state after successful update
      // setData((prevData) =>
      //   prevData.map((order) =>
      //     order.order_number === orderId
      //       ? { ...order, assigned_status: 'Assigned', worker_id: workerId, worker_name: workerName }
      //       : order
      //   )
      // );
      setAssignedWorkers((prev) => ({ ...prev, [orderId]: workerName })); // Store worker name for display
      fetchData();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order?")) {
      return;
    }

    try {
      await axios.delete(`${baseURL}/api/delete-order/${id}`);
      alert("Order deleted successfully");
      setOrders(orders.filter(order => order.id !== id)); // Update state after deletion
      fetchData();
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("Failed to delete order");
    }
  };

  const handleEdit = (id) => {
    navigate(`/a-edit-order/${id}`);
  };

  const exportToExcel = () => {
    // Use filteredData if available, otherwise export all data
    const exportData = filteredData.length > 0 ? filteredData : data;

    if (exportData.length === 0) {
      alert("No data available for export.");
      return;
    }

    // Map data into a structured format for Excel
    const worksheet = XLSX.utils.json_to_sheet(exportData.map(order => ({
      'Order No.': order.order_number,
      'Customer': order.account_name,
      'Mobile': order.mobile,
      'Date': new Date(order.date).toLocaleDateString('en-GB'),
      'Metal': order.metal,
      'Category': order.category,
      'Sub Category': order.subcategory,
      'Purity': order.purity,
      'Design Name': order.product_design_name,
      'Gross Wt': order.gross_weight,
      'Stone Wt': order.stone_weight,
      'Total Wt': order.total_weight_aw,
      'Total Amt': order.total_price,
      'Order Status': order.order_status,
      'Assigned Status': order.assigned_status,
      'Worker Name': order.worker_name,
      'Work Status': order.work_status,
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

    // Generate file name dynamically based on filter state
    const fileName = filteredData.length > 0 ? 'filtered_orders.xlsx' : 'all_orders.xlsx';

    XLSX.writeFile(workbook, fileName);
  };

  const handleRowSelect = (rowId) => {
    const selectedOrder = data.find((order) => order.id === rowId);

    if (selectedRows.length > 0) {
      const firstSelectedOrder = data.find((order) => order.id === selectedRows[0]);

      // Check if the selected mobile number is different
      if (selectedOrder.mobile !== firstSelectedOrder.mobile) {
        alert("You can only select orders with the same mobile number.");
        return;
      }
    }

    // Proceed with selection logic
    setSelectedRows((prevSelected) =>
      prevSelected.includes(rowId)
        ? prevSelected.filter((id) => id !== rowId)
        : [...prevSelected, rowId]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === data.length) {
      setSelectedRows([]); // Deselect all if already selected
      return;
    }

    if (data.length === 0) return; // No data available

    const firstMobileNumber = data[0].mobile; // Get the mobile number of the first order

    // Filter orders that match the first mobile number
    const sameMobileOrders = data.filter((order) => order.mobile === firstMobileNumber);

    if (sameMobileOrders.length !== data.length) {
      alert("You can only select orders with the same mobile number.");
      return;
    }

    // Select only orders with the same mobile number
    setSelectedRows(sameMobileOrders.map((row) => row.id));
  };

  const generateInvoiceNumber = (latestInvoice) => {
    if (!latestInvoice) return "INV001"; // Start from INV001 if none exist

    // Extract the numeric part and increment it
    const match = latestInvoice.match(/INV(\d+)/);
    if (match) {
      const nextNumber = String(parseInt(match[1]) + 1).padStart(3, "0"); // Increment and pad
      return `INV${nextNumber}`;
    }

    return "INV001"; // Fallback
  };

  const downloadPDF = async () => {
    if (selectedRows.length === 0) {
      alert("Please select at least one order to download.");
      return;
    }

    // Prepare selected data
    const selectedOrders = data.filter((order) => selectedRows.includes(order.id));
    setSelectedData(selectedOrders);

    try {
      // Fetch the latest invoice number
      const response = await fetch(`${baseURL}/api/get-latest-invoice`);
      const result = await response.json();

      const latestInvoice = result.latestInvoiceNumber; // Get the latest invoice number from DB
      const newInvoiceNumber = generateInvoiceNumber(latestInvoice); // Generate new number

      // Generate PDF Blob with Invoice Number
      const doc = <TaxINVoiceReceipt selectedOrders={selectedOrders} invoiceNumber={newInvoiceNumber} />;
      const pdfBlob = await pdf(doc).toBlob();

      // Trigger download
      saveAs(pdfBlob, `${newInvoiceNumber}.pdf`);
      await handleSavePDFToServer(pdfBlob, newInvoiceNumber);

      // Update database to set invoice_generated = 'Yes' and save invoice_number
      await fetch(`${baseURL}/api/update-invoice-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderIds: selectedRows,
          invoiceNumber: newInvoiceNumber, // Send the invoice number
        }),
      });

      alert(`Invoice ${newInvoiceNumber} generated successfully`);

      setSelectedRows([]);
      fetchData();
    } catch (error) {
      console.error("Error generating invoice:", error);
      alert("Failed to generate invoice.");
    }
  };

  const handleSavePDFToServer = async (pdfBlob, invoiceNumber) => {
    const formData = new FormData();
    formData.append("invoice", pdfBlob, `${invoiceNumber}.pdf`);

    try {
      const response = await fetch(`${baseURL}/api/upload-invoice`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload invoice");
      }

      console.log(`Invoice ${invoiceNumber} saved on server`);
    } catch (error) {
      console.error("Error uploading invoice:", error);
    }
  };

  const generateEstimateNumber = (latestEstimate) => {
    if (!latestEstimate) return "EST001"; // Start from EST001 if none exist

    const match = latestEstimate.match(/EST(\d+)/);
    if (match) {
      const nextNumber = String(parseInt(match[1]) + 1).padStart(3, "0"); // Increment and pad
      return `EST${nextNumber}`;
    }

    return "EST001"; // Fallback
  };

  const downloadEstimatePDF = async () => {
    if (selectedRows.length === 0) {
      alert("Please select at least one order to download the estimate.");
      return;
    }

    const selectedOrders = data.filter((order) => selectedRows.includes(order.id));
    setSelectedData(selectedOrders);

    try {
      // Fetch the latest estimate number
      const response = await fetch(`${baseURL}/api/get-latest-estimate`);
      const result = await response.json();

      const latestEstimate = result.latestEstimateNumber;
      const newEstimateNumber = generateEstimateNumber(latestEstimate);

      // Generate PDF Blob with Estimate Number
      const doc = <EstimateReceipt selectedOrders={selectedOrders} estimateNumber={newEstimateNumber} />;
      const pdfBlob = await pdf(doc).toBlob();

      // Trigger download
      saveAs(pdfBlob, `${newEstimateNumber}.pdf`);
      await handleSavePDFToServer(pdfBlob, newEstimateNumber);

      // Optional: Update database to mark estimate generated
      await fetch(`${baseURL}/api/update-estimate-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderIds: selectedRows,
          estimateNumber: newEstimateNumber, // Send the estimate number
        }),
      });

      alert(`Estimate ${newEstimateNumber} generated successfully`);

      setSelectedRows([]);
      fetchData();
    } catch (error) {
      console.error("Error generating estimate:", error);
      alert("Failed to generate estimate.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "red";
      case "Completed":
        return "green";
      case "In Progress":
        return "orange"; // Warning color
      case "Hold":
        return "orange";
      default:
        return "black";
    }
  };

  const columns = React.useMemo(
    () => [
      {
        Header: (
          <input
            type="checkbox"
            checked={selectedRows.length === data.length && data.length > 0}
            onChange={handleSelectAll}
          // disabled={data.every(row => row.invoice_generated === "Yes")} // Disable if all are invoiced
          />
        ),
        Cell: ({ row }) => (
          <input
            type="checkbox"
            checked={selectedRows.includes(row.original.id)}
            onChange={() => handleRowSelect(row.original.id)}
            disabled={row.original.invoice_generated === "Yes"} // Disable if invoice is generated
          />
        ),
        id: "select",
      },

      {
        Header: "Invoice",
        Cell: ({ row }) =>
          row.original.invoice_generated === "Yes" && row.original.invoice_number ? (
            <a
              href={`${baseURL}/invoices/${row.original.invoice_number}.pdf`} // Fetch from backend
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              📝 View
            </a>
          ) : (
            "Not Available"
          ),
        id: "invoice",
      },

      {
        Header: "Estimate",
        Cell: ({ row }) =>
          row.original.estimate_generated === "Yes" && row.original.estimate_number ? (
            <a
              href={`${baseURL}/invoices/${row.original.estimate_number}.pdf`} // Fetch from backend
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              📝 View
            </a>
          ) : (
            "Not Available"
          ),
        id: "estimate",
      },


      { Header: 'Sr. No.', Cell: ({ row }) => row.index + 1, id: 'sr_no' },
      {
        Header: 'Date',
        accessor: (row) => {
          const date = new Date(row.date);
          return date.toLocaleDateString('en-GB');
        },
        id: 'date', // Add an ID for the date column
      },
      {
        Header: 'Mobile',
        accessor: 'mobile',
        id: 'mobile', // Add an ID for the mobile column
      },
      {
        Header: 'Customer',
        accessor: 'account_name',
        id: 'customer', // Add an ID for the customer column
      },
      {
        Header: 'Order No.',
        accessor: 'order_number',
        id: 'order_no', // Add an ID for the order number column
      },
      {
        Header: 'Metal',
        accessor: 'metal',
        id: 'metal', // Add an ID for the metal column
      },
      {
        Header: 'Category',
        accessor: 'category',
        id: 'category', // Add an ID for the category column
      },
      {
        Header: 'Sub Category',
        accessor: 'subcategory',
        id: 'sub_category', // Add an ID for the subcategory column
      },
      {
        Header: 'Purity',
        accessor: 'purity',
        id: 'purity', // Add an ID for the purity column
      },
      {
        Header: 'Design Name',
        accessor: 'product_design_name',
        id: 'design_name', // Add an ID for the design name column
      },
      {
        Header: 'Gross Wt',
        accessor: 'gross_weight',
        id: 'gross_weight', // Add an ID for the gross weight column
      },
      {
        Header: 'Stone Wt',
        accessor: 'stone_weight',
        id: 'stone_weight', // Add an ID for the stone weight column
      },
      {
        Header: 'Total Wt',
        accessor: 'total_weight_aw',
        id: 'total_weight', // Add an ID for the total weight column
      },
      {
        Header: 'Total Amt',
        accessor: 'total_price',
        id: 'total_amt', // Add an ID for the total amount column
      },
      {
        Header: "Order Status",
        accessor: "order_status",
        id: 'order_status', // Add an ID for the order status column
        Cell: ({ row }) => {
          const [status, setStatus] = useState(row.original.order_status || "Placed");
          const isPending = row.original.work_status === "Pending"; // Check if work_status is Pending
          const isDisabled = row.original.order_status === "Canceled" || row.original.assigned_status === "Not Assigned"; // Disable if Canceled or Not Assigned

          const handleStatusChange = async (event) => {
            const newStatus = event.target.value;
            setStatus(newStatus);

            try {
              const response = await axios.put(`${baseURL}/api/orders/status/${row.original.id}`, {
                order_status: newStatus,
                worker_id: row.original.worker_id,
                worker_name: row.original.worker_name,
              });

              console.log("Status updated:", response.data);
              alert("Order status updated successfully!");
            } catch (error) {
              console.error("Error updating status:", error);
              alert("Failed to update status.");
            }
          };

          return (
            <select value={status} onChange={handleStatusChange} disabled={isDisabled}>
              <option value="Placed">Placed</option>
              <option value="Processing" disabled={isPending}>Processing</option>
              <option value="Ready for Delivery" disabled={isPending}>Ready for Delivery</option>
              <option value="Dispatched" disabled={isPending}>Dispatched</option>
              <option value="Shipped" disabled={isPending}>Shipped</option>
              <option value="Out for Delivery" disabled={isPending}>Out for Delivery</option>
              <option value="Delivered" disabled={isPending}>Delivered</option>
              <option value="Canceled" disabled={isPending}>Cancel</option>
            </select>
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
      {
        Header: 'Assign Worker',
        id: 'assign_worker', // Add an ID for the assign worker column
        Cell: ({ row }) => {
          const assignedWorkerName = row.original.worker_name;
          const isDisabled = row.original.assigned_status === 'Accepted';

          return (
            <select
              value={assignedWorkerName || ''}
              onChange={(e) => {
                const selectedWorker = workers.find(worker => worker.account_name === e.target.value);
                updateOrderWithWorker(row.original.id, selectedWorker?.id, selectedWorker?.account_name);
              }}
              disabled={isDisabled}
            >
              <option value="">Select Worker</option>
              {workers.map((worker) => (
                <option key={worker.id} value={worker.account_name}>
                  {worker.account_name}
                </option>
              ))}
            </select>
          );
        },
      },
      {
        Header: 'Assigned Status',
        accessor: 'assigned_status',
        id: 'assigned_status', // Add an ID for the assigned status column
        Cell: ({ row }) => row.original.assigned_status || '',
      },
      {
        Header: 'Worker Name',
        accessor: 'worker_name',
        id: 'worker_name', // Add an ID for the worker name column
        Cell: ({ row }) => row.original.worker_name || 'N/A',
      },
      {
        Header: "Work Status",
        accessor: "work_status",
        id: "work_status", // Add an ID for the work status column
        Cell: ({ row }) => (
          <span style={{ color: getStatusColor(row.original.work_status) }}>
            {row.original.work_status || "N/A"}
          </span>
        ),
      },
      {
        Header: 'Action',
        id: 'action', // Add an ID for the action column
        Cell: ({ row }) => (
          <div>
            <FaEye
              style={{ cursor: 'pointer', color: 'green' }}
              onClick={() => handleView(row.original)}
            />
            <FaEdit
              style={{ cursor: 'pointer', marginLeft: '10px', color: 'blue' }}
              onClick={() => handleEdit(row.original.id)}
            />
            <FaTrash
              style={{ cursor: 'pointer', marginLeft: '10px', color: 'red' }}
              onClick={() => handleDelete(row.original.id)}
            />
          </div>
        ),
      },
    ],
    [workers, assignedWorkers, selectedRows, data]
  );

  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleView = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };


  return (
    <>
      <Navbar />
      <div className="main-container">
        <div className="customers-table-container">
          <Row className="mb-3 d-flex justify-content-between align-items-center">
            <Col>
              <h3>Orders</h3>
            </Col>
            <Col className="d-flex justify-content-end gap-2">
              <Button onClick={downloadEstimatePDF} disabled={selectedRows.length === 0}>
                Generate Estimate
              </Button>
              <Button onClick={downloadPDF} disabled={selectedRows.length === 0}>
                Generate Invoice
              </Button>
              <Button
                className="export_but"
                onClick={exportToExcel}
                style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }}
              >
                Export to Excel
              </Button>
              <Button
                className="create_but"
                onClick={() => navigate('/a-orders')}
                style={{ backgroundColor: '#a36e29', borderColor: '#a36e29' }}
              >
                + Create
              </Button>
            </Col>
          </Row>
          {loading ? <div>Loading...</div> : <DataTable columns={columns} data={[...data].reverse()} />}
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

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Order Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <Row>
              <Col md={4}>
                <p><strong>Order No.:</strong> {selectedOrder.order_number}</p>
                <p><strong>Metal:</strong> {selectedOrder.metal}</p>
                <p><strong>Gross Weight:</strong> {selectedOrder.gross_weight}</p>
                <p><strong>Stone Price:</strong> {selectedOrder.stone_price}</p>
                <p><strong>Wastage%:</strong> {selectedOrder.wastage_percentage}</p>
                <p><strong>Rate:</strong> {selectedOrder.rate}</p>
                <p><strong>MC%:</strong> {selectedOrder.mc_percentage}</p>
                <p><strong>Tax Amt:</strong> {selectedOrder.tax_amount}</p>
                <p><strong>Order Status:</strong> {selectedOrder.order_status}</p>
                <p><strong>Advance Gross Weight:</strong> {selectedOrder.advance_gross_wt}</p>
              </Col>
              <Col md={4}>
                <p><strong>Category:</strong> {selectedOrder.category}</p>
                <p><strong>Design Name:</strong> {selectedOrder.product_design_name}</p>
                <p><strong>Stone Weight:</strong> {selectedOrder.stone_weight}</p>
                <p><strong>Weight BW:</strong> {selectedOrder.weight_bw}</p>
                <p><strong>Wastage Wt:</strong> {selectedOrder.wastage_weight}</p>
                <p><strong>Amount:</strong> {selectedOrder.amount}</p>
                <p><strong>Total MC:</strong> {selectedOrder.total_mc}</p>
                <p><strong>Total Price:</strong> {selectedOrder.total_price}</p>
                <p><strong>Worker:</strong> {selectedOrder.worker_name}</p>               
                <p><strong>Fine Weight:</strong> {selectedOrder.fine_wt}</p>            
              </Col>
              <Col md={4}>
                <p><strong>Subcategory:</strong> {selectedOrder.subcategory}</p>
                <p><strong>Purity:</strong> {selectedOrder.purity}</p>
                <p><strong>Stone Name:</strong> {selectedOrder.stone_name}</p>
                <p><strong>Wastage On:</strong> {selectedOrder.wastage_on}</p>
                <p><strong>Total Weight:</strong> {selectedOrder.total_weight_aw}</p>
                <p><strong>MC On:</strong> {selectedOrder.mc_on}</p>
                <p><strong>Tax%:</strong> {selectedOrder.tax_percentage}</p>
                <p><strong>Remarks:</strong> {selectedOrder.remarks}</p>
                <p><strong>Work Status:</strong> {selectedOrder.work_status}</p>
                <p><strong>Advance Amount:</strong> {selectedOrder.advance_amount}</p>
              </Col>
              {/* {selectedOrder.image_url && (
                <div>
                  <strong>Image:</strong><br />
                  <img
                    src={`${baseURL}${selectedOrder.image_url}`}
                    alt="Order"
                    style={{ width: '150px', borderRadius: '8px', marginTop: '10px' }}
                  />
                </div>
              )} */}
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>


    </>
  );
};

export default ViewOrders;