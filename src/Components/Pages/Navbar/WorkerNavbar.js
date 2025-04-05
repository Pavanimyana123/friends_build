import React, { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FaSignOutAlt, FaWhatsapp } from "react-icons/fa";
import logo from '../../Pages/Images/logo.jpeg';
import './WorkerNavbar.css';
import Swal from 'sweetalert2';
import { AuthContext } from "../../AuthContext/ContextApi";

function VendorNavbar() {

    const { user } = useContext(AuthContext);
    const userName = user?.account_name
    const [isOpen, setIsOpen] = useState(false);
    const [ordersDropdownOpen, setOrdersDropdownOpen] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    const toggleMenu = () => setIsOpen(!isOpen);
    const toggleDropdown = () => setOrdersDropdownOpen(!ordersDropdownOpen);

    const handleItemClick = () => {
        setOrdersDropdownOpen(false);
    };

    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';  // Return 'active' if the path matches the current location
    };

    const handleLogout = () => {
        navigate("/");
    };



    return (
        <header className="navbar-header">
            <div className="navbar-brand">
                <img src={logo} alt="Logo" style={{ width: "130px" }} />
            </div>

            <div className={`navbar-hamburger ${isOpen ? 'open' : ''}`} onClick={toggleMenu}>
                <div className="navbar-bar"></div>
                <div className="navbar-bar"></div>
                <div className="navbar-bar"></div>
            </div>

            <nav className={`navbar-links ${isOpen ? 'open' : ''}`}>
                <Link
                    to="/w-dashboard"
                    onClick={handleItemClick}
                    className={window.location.pathname === '/w-dashboard' ? 'active' : ''}
                >
                    Dashboard</Link>
                <Link
                    to="/w-assigned-orders"
                    onClick={handleItemClick}
                    className={window.location.pathname === '/w-assigned-orders' ? 'active' : ''}
                >
                    Assigned</Link>
                <Link
                    to="/w-inprogress-orders"
                    onClick={handleItemClick}
                    className={window.location.pathname === '/w-inprogress-orders' ? 'active' : ''}
                >
                    InProgress</Link>
                <Link
                    to="/w-completed-orders"
                    onClick={handleItemClick}
                    className={window.location.pathname === '/w-completed-orders' ? 'active' : ''}
                >
                    Completed</Link>
                    <Link
                    to="/w-pending-orders"
                    onClick={handleItemClick}
                    className={window.location.pathname === '/w-pending-orders' ? 'active' : ''}
                >
                    Pending</Link>
                    <Link
                    to="/w-hold-orders"
                    onClick={handleItemClick}
                    className={window.location.pathname === '/w-hold-orders' ? 'active' : ''}
                >
                    On Hold</Link>      
                <Link
                    to="/"
                    onClick={handleItemClick}
                    className='logout-desktop'
                    style={{
                        color: window.location.pathname === '/' ? '#a36e29' : 'black',
                        backgroundColor: 'transparent',
                        textDecoration: 'none',
                    }}
                >
                    Logout</Link>

            </nav>
            <div className='username'>
                {userName}
            </div>
            <div className="navbar-logout" onClick={handleLogout}>
                <FaSignOutAlt className="logout-icon" />
            </div>
        </header>
    );
}

export default VendorNavbar;
