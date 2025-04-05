
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { Bar, Pie, Line } from 'react-chartjs-2';
import CustomerNavbar from '../../../Pages/Navbar/CustomerNavbar';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, } from 'chart.js';
import baseURL from '../../../../Url/NodeBaseURL';
import { AuthContext } from "../../../AuthContext/ContextApi";

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
  const { user } = useContext(AuthContext);
  
  const [orderCount, setOrderCount] = useState(0);
  const [cancelledOrderCount, setCancelledOrderCount] = useState(0);
  const [deliveredOrderCount, setDeliveredOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`${baseURL}/api/orders`);
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        const result = await response.json();
        
        // Filter orders based on user ID
        const userOrders = result.filter(order => order.account_id === user?.id);
        setOrderCount(userOrders.length);

        const cancelledOrders = userOrders.filter(order => order.order_status === "Canceled");
        const deliveredOrders = userOrders.filter(order => order.order_status === "Delivered");
        setCancelledOrderCount(cancelledOrders.length);
        setDeliveredOrderCount(deliveredOrders.length);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [baseURL, user]);

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
    { title: "Orders", link: "/c-vieworders", count: orderCount },
    { title: "Cancelled", link: "/c-cancelorders", count: cancelledOrderCount },
    { title: "Delivered", link: "/c-vieworders", count: deliveredOrderCount },
    { title: "Order History", link: "/c-orderhistory", count: orderCount },
    
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
    labels: ['Cancelled', 'Delivered', 'In Progress'],
    datasets: [
      {
        data: [50, 30, 20],
        backgroundColor: ['#cd853f', '#8b4513', '#ffa500'],
      },
    ],
  };

  return (
    <>
      <CustomerNavbar />
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