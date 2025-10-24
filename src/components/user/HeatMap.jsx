import React, { useEffect, useState } from "react";
import HeatMap from "@uiw/react-heat-map";
import axios from "axios";
import { useParams } from "react-router-dom";

const HeatMapProfile = () => {
  const [activityData, setActivityData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get the profile user ID from the URL, or default to logged in user
  const params = useParams();
  const profileUserId = params.id || localStorage.getItem("userId");

  useEffect(() => {
    if (profileUserId) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const token = localStorage.getItem('token');
          const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

          // Call our API endpoint
          const response = await axios.get(
            `http://localhost:3000/api/user/${profileUserId}/contributions`,
            config
          );

          console.log("DEBUG: Received contribution data:", response.data);
          setActivityData(response.data);
        } catch (err) {
          console.error("Error fetching contribution data:", err);
          setActivityData([]); // Set empty data on error
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    } else {
      setIsLoading(false);
      setActivityData([]);
    }
  }, [profileUserId]); // Re-run if the profile user ID changes

  if (isLoading) {
    return <h4>Loading contributions...</h4>;
  }

  // Add a check for empty data *after* loading is complete
  if (!isLoading && activityData.length === 0) {
    return (
      <div>
        <h4>Recent Contributions</h4>
        <p style={{ color: '#8b949e', fontSize: '14px' }}>No contributions found for this period.</p>
      </div>
    );
  }

  // List of month abbreviations for manual UTC date formatting
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div>
      <h4>Recent Contributions</h4>
      {/* The library handles the main visualization based on the 'value' prop */}
      <HeatMap
        className="HeatMapProfile"
        style={{ maxWidth: "700px", height: "auto", color: "white" }}
        value={activityData}
        // Heatmap settings
        weekLabels={["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]}
        rectSize={12}
        space={2}
        rectProps={{
          rx: 2.5,
        }}
        // Custom renderer for the squares to include the tooltip
        rectRender={(props, data) => {
          let tooltipText = 'No contributions';

          // Use the data object to determine the tooltip text
          if (data && data.count !== undefined && data.date) {
            const date = new Date(data.date);

            // FIX: Use UTC date methods (getUTCFullYear, getUTCMonth, getUTCDate) 
            // to prevent date shifting based on local time zone offset.
            const year = date.getUTCFullYear();
            const month = monthNames[date.getUTCMonth()];
            const day = date.getUTCDate();

            const formattedDate = `${month} ${day}, ${year}`;

            tooltipText = `${data.count} contribution${data.count !== 1 ? 's' : ''} on ${formattedDate}`;
          }

          // Return the rect element with an SVG <title> element for the native tooltip
          return (
            <rect {...props}>
              <title>{tooltipText}</title>
            </rect>
          );
        }}
      />
    </div>
  );
};

export default HeatMapProfile;