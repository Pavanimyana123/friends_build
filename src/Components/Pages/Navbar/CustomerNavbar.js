import React, { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FaSignOutAlt, FaUserCircle } from "react-icons/fa"; // Import the profile icon
import logo from '../../Pages/Images/logo.jpeg';
import './CustomerNavbar.css';
import { AuthContext } from "../../AuthContext/ContextApi";

function VendorNavbar() {
    const { user } = useContext(AuthContext);
    const userName = user?.account_name;
    const [isOpen, setIsOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false); // State for profile dropdown

    const location = useLocation();
    const navigate = useNavigate();

    const toggleMenu = () => setIsOpen(!isOpen);
    const toggleProfileDropdown = () => setProfileDropdownOpen(!profileDropdownOpen); // Toggle profile dropdown

    const handleItemClick = () => {
        setProfileDropdownOpen(false);
    };

    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';  // Return 'active' if the path matches the current location
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/");
    };


    return (
        <header className="navbar-header">
            <div className="navbar-brand">
                <img src={logo} alt="Logo" />
            </div>

            <div className={`navbar-hamburger ${isOpen ? 'open' : ''}`} onClick={toggleMenu}>
                <div className="navbar-bar"></div>
                <div className="navbar-bar"></div>
                <div className="navbar-bar"></div>
            </div>

            <nav className={`navbar-links ${isOpen ? 'open' : ''}`}>
                <Link
                    to="/c-dashboard"
                    onClick={handleItemClick}
                    className={window.location.pathname === '/c-dashboard' ? 'active' : ''}
                >
                    Dashboard</Link>
                <Link
                    to="/c-vieworders"
                    onClick={handleItemClick}
                    className={window.location.pathname === '/c-vieworders' ? 'active' : ''}
                >
                    View Orders</Link>
                <Link
                    to="/c-cancelorders"
                    onClick={handleItemClick}
                    className={window.location.pathname === '/c-cancelorders' ? 'active' : ''}
                >
                    Cancel Orders</Link>
            </nav>

            <div className='username'>
                {userName}
            </div>

            {/* Profile Icon with Dropdown */}
            <div className="customer-navbar-profile" onClick={toggleProfileDropdown}>
                <FaUserCircle className="customer-profile-icon" />
                {profileDropdownOpen && (
                    <div className="customer-profile-dropdown">
                        <Link to="/profile-details"
                            onClick={handleItemClick}
                            className={`customer-profile-dropdown-item ${isActive('/profile-details')}`}>
                            Profile
                        </Link>
                        <div className="customer-profile-dropdown-item" onClick={handleLogout}>Logout</div>
                    </div>
                )}
            </div>
        </header>
    );
}

export default VendorNavbar;