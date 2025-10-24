import React, { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import "./sidebar.css";

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const sidebarRef = useRef();
    const [searchQuery, setSearchQuery] = useState("");

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                toggleSidebar();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, toggleSidebar]);

    // Swipe left to close
    useEffect(() => {
        let startX = 0;
        const handleTouchStart = (e) => { startX = e.touches[0].clientX; };
        const handleTouchEnd = (e) => {
            const endX = e.changedTouches[0].clientX;
            if (startX - endX > 50) toggleSidebar();
        };
        const el = sidebarRef.current;
        if (el) { el.addEventListener("touchstart", handleTouchStart); el.addEventListener("touchend", handleTouchEnd); }
        return () => { if (el) { el.removeEventListener("touchstart", handleTouchStart); el.removeEventListener("touchend", handleTouchEnd); } };
    }, [toggleSidebar]);


    // Define links including the new Projects link target
    const sidebarLinks = [
        { path: "/", name: "Overview", end: true }, // Overview points to Dashboard
        // Change /repos path to point to Dashboard "/"
        { path: "/", name: "Repositories", end: true }, // Repositories points to Dashboard
        { path: "/projects", name: "Projects", end: false }, // Points to new placeholder
    ];

    const filteredLinks = sidebarLinks.filter(link =>
        link.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            {isOpen && <div className="sidebar-backdrop" onClick={toggleSidebar}></div>}
            <div className={`sidebar ${isOpen ? "open" : ""}`} ref={sidebarRef}>
                <button className="close-btn" onClick={toggleSidebar} aria-label="Close Sidebar">×</button>
                <div className="sidebar-user"><p>Test User</p></div> {/* Placeholder */}
                <div className="sidebar-search">
                    <input
                        type="text"
                        placeholder="Filter items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="sidebar-links">
                    {filteredLinks.length > 0 ? (
                        filteredLinks.map((link) => (
                            <NavLink
                                key={link.name} // Use name as key if paths can duplicate (like "/")
                                to={link.path}
                                end={link.end}
                                className={({ isActive }) => (isActive ? "active" : "")}
                                onClick={toggleSidebar}
                            >
                                {link.name}
                            </NavLink>
                        ))
                    ) : (
                        <p className="no-results">No items match.</p>
                    )}
                </div>
            </div>
        </>
    );
};

export default Sidebar;