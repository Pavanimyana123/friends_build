
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { Bar, Pie, Line } from 'react-chartjs-2';
import Navbar from '../../../Pages/Navbar/Navbar';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, } from 'chart.js';
import baseURL from '../../../../Url/NodeBaseURL';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

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
  const [deliveredOrderCount, setDeliveredOrderCount] = useState(0);
  const [completedOrderCount, setCompletedOrderCount] = useState(0);
  const [holdOrderCount, setHoldOrderCount] = useState(0);
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
        const hold = result.filter(
          (order) => order.work_status && order.work_status.toLowerCase() === 'hold'
        ).length;

        setPendingOrderCount(pending);
        setInProgressOrderCount(inProgress);
        setCompletedOrderCount(completed);
        setHoldOrderCount(hold);

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

        const deliveredOrders = result.filter(
          (order) => order.order_status === "Delivered"
        );

        setCancelOrderCount(cancelledOrders.length);
        setDeliveredOrderCount(deliveredOrders.length);
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

    const path = routes[title] || "/a-dashboard"; 
    navigate(path);
  };

  const cards = [
    { title: "Customers", count: customerCount },
    { title: "Workers", count: workerCount },
    { title: "Orders", count: orderCount },
    { title: "Cancelled", count: cancelOrderCount },
    { title: "Delivered", count: deliveredOrderCount },
    { title: "Pending", count: pendingOrderCount },
    { title: "In progress", count: inProgressOrderCount },
    { title: "Completed", count: completedOrderCount },
    { title: "On Hold", count: holdOrderCount },
  ];

  // const barData = {
  //   labels: ['Sales', 'Repairs', 'Orders'],
  //   datasets: [
  //     {
  //       label: 'Amount',
  //       data: [3000, 2500, 2000],
  //       backgroundColor: ['#cd853f', '#8b4513', '#ffa500'],
  //     },
  //   ],
  // };

  const pieDataReceivablesPayables = {
    labels: ['Receivables', 'Payables'],
    datasets: [
      {
        data: [60, 40],
        backgroundColor: ['#cd853f', '#8b4513'],
      },
    ],
  };

  const lineDataRevenue = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr'],
    datasets: [
      {
        label: 'Revenue',
        data: [10000, 15000, 12000, 20000],
        borderColor: '#cd853f',
        borderWidth: 2,
        fill: false,
      },
    ],
  };

  const pieDataOrderStatus = {
    labels: ['Completed', 'Pending', 'In Progress'],
    datasets: [
      {
        data: [50, 30, 20],
        backgroundColor: ['#cd853f', '#8b4513', '#ffa500'],
      },
    ],
  };

  return (
    <>
      <Navbar />
      <div className="main-container" style={{ backgroundColor: '#b7721834', minHeight:'100vh' }}>
        <div className="dashboard-header">
          <h2 style={{ marginTop: "25px", marginLeft: "15px" }}>Dashboard</h2>
          {/* <CustomerDashboard onSelectCustomer={setSelectedMobile} /> */}
        </div>
        <div className="dashboard-container">
          <div className="row-cards" style={{ marginTop: '15px', marginBottom: '15px' }}>
            {cards.map((card, index) => (
              <div key={index} className="metric-card">
                <h3>{card.title}</h3>
                <p style={{fontSize:'25px', color:'black', marginTop:'20px'}}>{card.count}</p>
              </div>
            ))}
          </div>
          <div className="row-cards" style={{ marginTop: '15px', marginBottom: '15px' }}>
            {/* <div className="metric-card">
              <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div> */}
            <div className="metric-card">
              <Pie data={pieDataReceivablesPayables} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
            <div className="metric-card">
              <Line data={lineDataRevenue} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
            <div className="metric-card">
              <Pie data={pieDataOrderStatus} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;