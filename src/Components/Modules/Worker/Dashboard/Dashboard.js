
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { Bar, Pie, Line } from 'react-chartjs-2';
import WorkerNavbar from '../../../Pages/Navbar/WorkerNavbar';
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
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inProgressCount, setInProgressCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [holdCount, setHoldCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
      const fetchData = async () => {
          try {
              const response = await fetch(`${baseURL}/api/orders`);
              if (!response.ok) {
                  throw new Error('Failed to fetch data');
              }
              const result = await response.json();

              // Filter orders by worker_id
              const filteredData = result.filter(order => order.worker_id === user?.id);
              setData(filteredData);
              console.log("Filtered Orders =", filteredData);

              // Count orders based on work_status
              const inProgress = filteredData.filter(order => order.work_status.toLowerCase() === "in progress").length;
              const completed = filteredData.filter(order => order.work_status.toLowerCase() === "completed").length;
              const hold = filteredData.filter(order => order.work_status.toLowerCase() === "hold").length;
              const pending = filteredData.filter(order => order.work_status.toLowerCase() === "pending").length;

              setInProgressCount(inProgress);
              setCompletedCount(completed);
              setHoldCount(hold);
              setPendingCount(pending);

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

  const cards = [
    { title: "Assigned", link: "/w-assigned-orders", count: data.length }, // Total assigned orders
    { title: "Pending", link: "/w-pending-orders", count: pendingCount }, // Pending count
    { title: "In Progress", link: "/w-inprogress-orders", count: inProgressCount }, // In Progress count
    { title: "Completed", link: "/w-completed-orders", count: completedCount }, // Completed count
    { title: "On Hold", link: "/w-hold-orders", count: holdCount }, // On Hold count   
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
    labels: ['Pending', 'Completed', 'In Progress', 'On Hold'],
    datasets: [
      {
        data: [40, 30, 20, 10],
        backgroundColor: ['#cd853f', '#8b4513', '#ffa500', '#f2cc5d'],
      },
    ],
  };

  return (
    <>
      <WorkerNavbar />
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