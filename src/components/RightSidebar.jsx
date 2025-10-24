import React, { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import "./rightSidebar.css";

const RightSidebar = ({ isOpen, toggleRightSidebar }) => {
    const sidebarRef = useRef();

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (isOpen && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
                toggleRightSidebar();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, toggleRightSidebar]);

    // Swipe right to close
    useEffect(() => {
        let startX = 0;
        const handleTouchStart = (e) => { startX = e.touches[0].clientX; };
        const handleTouchEnd = (e) => {
            const endX = e.changedTouches[0].clientX;
            if (endX - startX > 50) toggleRightSidebar();
        };
        const el = sidebarRef.current;
        if (el) { el.addEventListener("touchstart", handleTouchStart); el.addEventListener("touchend", handleTouchEnd); }
        return () => { if (el) { el.removeEventListener("touchstart", handleTouchStart); el.removeEventListener("touchend", handleTouchEnd); } };
    }, [toggleRightSidebar]);

    return (
        <>
            {isOpen && <div className="right-sidebar-backdrop" onClick={toggleRightSidebar}></div>}
            <div className={`right-sidebar ${isOpen ? "open" : ""}`} ref={sidebarRef}>
                <button className="close-btn" onClick={toggleRightSidebar} aria-label="Close Right Sidebar">×</button>
                <h3>GitHub Menu</h3>
                <ul>
                    {/* Changed "/dashboard" to "/" */}
                    <li><NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")} onClick={toggleRightSidebar}>Dashboard</NavLink></li>
                    {/* Changed "/repos" to "/" */}
                    <li><NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")} onClick={toggleRightSidebar}>Your Repositories</NavLink></li>
                    <li><NavLink to="/stars" className={({ isActive }) => (isActive ? "active" : "")} onClick={toggleRightSidebar}>Stars</NavLink></li>
                    <li><NavLink to="/explore" className={({ isActive }) => (isActive ? "active" : "")} onClick={toggleRightSidebar}>Explore</NavLink></li>
                    <li><NavLink to="/settings" className={({ isActive }) => (isActive ? "active" : "")} onClick={toggleRightSidebar}>Settings</NavLink></li>
                </ul>
            </div>
        </>
    );
};

export default RightSidebar;