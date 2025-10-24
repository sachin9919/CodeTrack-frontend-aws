import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import RightSidebar from "../RightSidebar";

const MainLayout = ({
    isSidebarOpen,
    toggleSidebar,
    isRightSidebarOpen,
    toggleRightSidebar,
}) => {
    return (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", position: "relative" }}>
            <Navbar
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
                isRightSidebarOpen={isRightSidebarOpen}
                toggleRightSidebar={toggleRightSidebar}
            />
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <RightSidebar isOpen={isRightSidebarOpen} toggleRightSidebar={toggleRightSidebar} />

            <div className="main-content">
                <Outlet />
            </div>
        </div>
    );
};

export default MainLayout;