import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../Pages/Navbar/Navbar';
import './Dashboard.css';
import baseURL from '../../../../Url/NodeBaseURL';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

function Dashboard() {
  const navigate = useNavigate();
  const [customerCount, setCustomerCount] = useState(0);
  const [workerCount, setWorkerCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [pendingOrderCount, setPendingOrderCount] = useState(0);
  const [inProgressOrderCount, setInProgressOrderCount] = useState(0);
  const [cancelOrderCount, setCancelOrderCount] = useState(0);
  const [completedOrderCount, setCompletedOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${baseURL}/accounts`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();

        // Filter customers and format dates if needed
        const customers = result.filter(
          (item) => item.account_group === 'CUSTOMERS'
        ).map((item) => ({
          ...item,
          birthday: formatDate(item.birthday),
          anniversary: formatDate(item.anniversary),
        }));

        // Filter workers and format dates if needed
        const workers = result.filter(
          (item) => item.account_group === 'WORKER'
        ).map((item) => ({
          ...item,
          birthday: formatDate(item.birthday),
          anniversary: formatDate(item.anniversary),
        }));

        // Set counts dynamically
        setCustomerCount(customers.length);
        setWorkerCount(workers.length);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [baseURL]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`${baseURL}/api/orders`);
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        const result = await response.json();
        
        setOrderCount(result.length);
        
        // Calculate dynamic counts based on work_status
        const pending = result.filter(
          (order) => order.work_status && order.work_status.toLowerCase() === 'pending'
        ).length;
        const inProgress = result.filter(
          (order) => order.work_status && order.work_status.toLowerCase() === 'in progress'
        ).length;
        const completed = result.filter(
          (order) => order.work_status && order.work_status.toLowerCase() === 'completed'
        ).length;

        setPendingOrderCount(pending);
        setInProgressOrderCount(inProgress);
        setCompletedOrderCount(completed);

      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [baseURL]);

  useEffect(() => {
    const fetchCancelOrders = async () => {
      try {
        const response = await fetch(`${baseURL}/api/orders`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();

        // Filter orders where order_status is "Canceled"
        const cancelledOrders = result.filter(
          (order) => order.order_status === "Canceled"
        );

        setCancelOrderCount(cancelledOrders.length);
        console.log("Cancelled Orders:", cancelledOrders);
      } catch (error) {
        console.error('Error fetching cancel orders:', error);
      }
    };

    fetchCancelOrders();
  }, [baseURL]);

  const handleCardClick = (title) => {
    const routes = {
      "Customers": "/a-customertable",
      "Workers": "/a-workertable",
      "Orders": "/a-view-orders",
      // "Pending Orders": "/orders/pending",
      // "In progress Orders": "/orders/in-progress",
      "Cancel Orders": "/a-cancel-orders",
      // "Completed Orders": "/orders/completed",
    };

    const path = routes[title] || "/a-dashboard"; // Default to dashboard if no match
    navigate(path);
  };

  const cards = [
    { title: "Customers", count: customerCount },
    { title: "Workers", count: workerCount },
    { title: "Orders", count: orderCount },
    { title: "Pending Orders", count: pendingOrderCount },
    { title: "In progress Orders", count: inProgressOrderCount },
    { title: "Cancel Orders", count: cancelOrderCount },
    { title: "Completed Orders", count: completedOrderCount },
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="worker-dashboard-container">
        <h1 className="dashboard-title">Dashboard</h1>
        <div className="dashboard-cards">
          {cards.map((card, index) => (
            <div
              className="dashboard-card"
              key={index}
              onClick={() => handleCardClick(card.title)}
              style={{ cursor: "pointer" }} // Add cursor pointer to indicate clickability
            >
              <h3>{card.title}</h3>
              <p className="dashboard-count">{card.count}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Dashboard;
