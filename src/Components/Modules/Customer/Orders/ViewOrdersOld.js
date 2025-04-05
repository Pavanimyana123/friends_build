import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../../Pages/InputField/TableLayout'; // Import the reusable DataTable component
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { Button, Row, Col, Modal } from 'react-bootstrap';
import './ViewOrders.css';
import baseURL from '../../../../Url/NodeBaseURL';
import CustomerNavbar from '../../../Pages/Navbar/CustomerNavbar';
import { AuthContext } from "../../../AuthContext/ContextApi";

const ViewOrders = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState([]); 
  const [loading, setLoading] = useState(true); 
 
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
        Header: 'Customer Name',
        accessor: 'account_name',
      },
      {
        Header: 'Order Number',
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
    ],
    []
  );
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${baseURL}/api/orders`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();
  
        // Filter orders based on account_id matching user.id
        const filteredData = result.filter(order => order.account_id === user?.id);
  
        setData(filteredData); // Set the filtered data
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
  }, [baseURL, user]);  // Include user in dependency array to fetch data when user changes
  

  return (
    <>
    <CustomerNavbar />
    <div className="main-container">
      <div className="customers-table-container">
        <Row className="mb-3">
          <Col className="d-flex justify-content-between align-items-center">
            <h3>Orders</h3>
          </Col>
        </Row>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <DataTable columns={columns} data={[...data].reverse()} />
        )}
      </div>
    </div>
    </>
  );
};

export default ViewOrders;
