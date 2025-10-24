import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../authContext";
import "./navbar.css";
import { BellIcon, PlusIcon, MarkGithubIcon } from '@primer/octicons-react';
import DateDisplay from "./DateDisplay";

const Navbar = ({ toggleSidebar, toggleRightSidebar }) => {
    const navigate = useNavigate();
    const { setCurrentUser } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [avatarUrl, setAvatarUrl] = useState(localStorage.getItem("avatarUrl") || '');

    useEffect(() => {
        const handleAvatarUpdate = () => {
            setAvatarUrl(localStorage.getItem("avatarUrl") || '');
        };
        window.addEventListener('avatarUpdated', handleAvatarUpdate);
        handleAvatarUpdate(); // Run on load
        return () => window.removeEventListener('avatarUpdated', handleAvatarUpdate);
    }, []);

    const handleNewRepoClick = () => { navigate("/createRepo"); };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("avatarUrl");
        if (setCurrentUser) setCurrentUser(null);
        setAvatarUrl('');
        setIsDropdownOpen(false);
        navigate("/auth");
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                const profileButton = document.querySelector('.profile-icon-button');
                if (profileButton && !profileButton.contains(event.target)) {
                    setIsDropdownOpen(false);
                }
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSearchSubmit = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            e.preventDefault();
            navigate(`/search?q=${searchQuery.trim()}`);
            setSearchQuery("");
        }
    };

    return (
        <nav className="navbar">
            <div className="nav-left">
                {/* Styling moved to navbar.css */}
                <button
                    className="hamburger-icon nav-icon"
                    onClick={toggleSidebar}
                    aria-label="Toggle sidebar"
                >
                    ☰
                </button>
                <Link to="/" className="logo-link">
                    {/* Added class for MarkGithubIcon to allow pulsing animation */}
                    <MarkGithubIcon size={32} className="main-logo-icon" />
                </Link>
            </div>

            <div className="nav-search search-container">
                <input
                    type="text"
                    placeholder="Search or jump to..."
                    value={searchQuery}
                    id="navbar-search"
                    name="navbar-search"
                    onChange={handleSearchChange}
                    onKeyDown={handleSearchSubmit}
                />
            </div>

            <div className="nav-right">
                <DateDisplay />
                <button className="nav-icon" title="Notifications">
                    <BellIcon size={18} />
                </button>
                <button
                    className="nav-icon plus-icon"
                    title="Create new"
                    onClick={handleNewRepoClick}
                >
                    <PlusIcon size={18} />
                </button>

                {/* Profile Dropdown Container */}
                <div className="profile-menu-container" ref={dropdownRef}>
                    <button
                        className="profile-icon-button"
                        onClick={() => setIsDropdownOpen((prev) => !prev)}
                        aria-haspopup="true"
                        aria-expanded={isDropdownOpen}
                    >
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" className="nav-avatar" />
                        ) : (
                            <div className="nav-avatar profile-icon-placeholder"></div>
                        )}
                    </button>
                    <div className={`profile-dropdown-menu ${isDropdownOpen ? 'open' : ''}`}>
                        <Link to="/profile" onClick={() => setIsDropdownOpen(false)}>
                            Your Profile
                        </Link>
                        <button onClick={handleLogout} className="logout-button">
                            Logout
                        </button>
                    </div>
                </div>

                <button
                    className="nav-icon nav-right-icon"
                    onClick={toggleRightSidebar}
                    aria-label="Toggle menu sidebar"
                >
                    <MarkGithubIcon size={18} />
                </button>
            </div>
        </nav>
    );
};

export default Navbar;