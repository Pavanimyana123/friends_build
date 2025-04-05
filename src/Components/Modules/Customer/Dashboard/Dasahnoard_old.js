import React, { useContext, useEffect, useState } from 'react';
import CustomerNavbar from '../../../Pages/Navbar/CustomerNavbar';
import './Dashboard.css';
import { AuthContext } from "../../../AuthContext/ContextApi";
import baseURL from '../../../../Url/NodeBaseURL';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  
  const [orderCount, setOrderCount] = useState(0);
  const [cancelledOrderCount, setCancelledOrderCount] = useState(0);
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
        
        // Filter cancelled orders
        const cancelledOrders = userOrders.filter(order => order.order_status === "Canceled");
        setCancelledOrderCount(cancelledOrders.length);
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

  if (!user || loading) {
    return <p>Loading...</p>; // Show loading message until data is available
  }

  const cards = [
    { title: "View Orders", link: "/c-vieworders", count: orderCount },
    { title: "Cancel Orders", link: "/c-cancelorders", count: cancelledOrderCount },
    { title: "Track Order", link: "/c-trackorder", count: Math.floor(orderCount / 2) },
    { title: "Order History", link: "/c-orderhistory", count: orderCount },
    { title: "Support & Help", link: "/c-support", count: 5 },
    { title: "Profile & Settings", link: "/c-profile", count: 1 },
  ];

  return (
    <>
      <CustomerNavbar />
      <div className="worker-dashboard-container">
        <h1 className="dashboard-title">Dashboard</h1>       
        <div className="dashboard-cards">
          {cards.map((card, index) => (
            <a href={card.link} key={index} className="dashboard-card">
              <h3>{card.title}</h3>
              <span className="card-count">{card.count}</span>
            </a>
          ))}
        </div>
      </div>
    </>
  );
};

export default Dashboard;

