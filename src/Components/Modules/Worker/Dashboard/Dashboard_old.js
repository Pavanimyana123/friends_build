



import React, { useContext, useEffect, useState } from 'react';
import './Dashboard.css';
import WorkerNavbar from '../../../Pages/Navbar/WorkerNavbar';
import { AuthContext } from "../../../AuthContext/ContextApi";
import baseURL from '../../../../Url/NodeBaseURL';

const Dashboard = () => {
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

    const workerCards = [
        { title: "Assigned Orders", link: "/w-assigned-orders", count: data.length }, // Total assigned orders
        { title: "Pending Orders", link: "/w-pending-orders", count: pendingCount }, // Pending count
        { title: "In Progress Orders", link: "/w-inprogress-orders", count: inProgressCount }, // In Progress count
        { title: "Completed Orders", link: "/w-completed-orders", count: completedCount }, // Completed count
        { title: "On Hold Orders", link: "/w-hold-orders", count: holdCount }, // On Hold count   
    ];

    return (
        <>
            <WorkerNavbar />
            <div className="worker-dashboard-container">
                <h1 className="dashboard-title">Dashboard</h1>
                    <div className="dashboard-cards">
                        {workerCards.map((card, index) => (
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


