import React, { useState, useEffect } from 'react';
import { CalendarIcon } from '@primer/octicons-react'; // --- ADDED IMPORT ---

const DateDisplay = () => {
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        // Update the date once a minute
        const intervalId = setInterval(() => {
            setCurrentDate(new Date());
        }, 60000); // Update every 60 seconds

        return () => clearInterval(intervalId);
    }, []);

    // Format the date (e.g., Oct 24, 2025)
    const formattedDate = currentDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

    return (
        // --- UPDATED WRAPPER div ---
        <div className="navbar-date" style={{ color: '#c9d1d9', fontSize: '14px', marginRight: '15px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <CalendarIcon size={16} /> {/* --- ADDED ICON --- */}
            <span>{formattedDate}</span> {/* --- WRAPPED date in span --- */}
        </div>
    );
};

export default DateDisplay;