import React, { useState, useEffect } from 'react';
import './dashboard.css'; // Uses styles from dashboard.css

const AnalogClock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const intervalId = setInterval(() => {
            setTime(new Date());
        }, 1000); // Update every second

        return () => clearInterval(intervalId); // Cleanup on unmount
    }, []);

    const seconds = time.getSeconds();
    const minutes = time.getMinutes();
    const hours = time.getHours();

    // Calculate degrees for each hand (0 degrees is 12 o'clock)
    const secondsDeg = (seconds / 60) * 360;
    const minutesDeg = (minutes / 60) * 360 + (seconds / 60) * 6; // Add fractional minute movement
    const hoursDeg = (hours / 12) * 360 + (minutes / 60) * 30; // Add fractional hour movement

    return (
        <div className="clock-container">
            <div className="clock">
                <div className="center-nut"></div>
                <div
                    className="hour-hand"
                    // CSS handles initial positioning, JS adds rotation
                    style={{ transform: `translate(-50%, -100%) rotate(${hoursDeg}deg)` }}
                ></div>
                <div
                    className="minute-hand"
                    style={{ transform: `translate(-50%, -100%) rotate(${minutesDeg}deg)` }}
                ></div>
                <div
                    className="second-hand"
                    style={{ transform: `translate(-50%, -100%) rotate(${secondsDeg}deg)` }}
                ></div>
                {/* Hour Markings */}
                {[...Array(12)].map((_, i) => (
                    <div key={i} className="hour-mark" style={{ transform: `translateX(-50%) rotate(${i * 30}deg)` }}>
                        <div className="mark"></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AnalogClock;