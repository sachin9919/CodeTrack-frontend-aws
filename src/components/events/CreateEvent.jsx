import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// REMOVED: import axios from 'axios';
// IMPORT THE NEW CENTRAL API CONFIG
import api from '../../api/axiosConfig';
import './events.css'; // Import the CSS
import Spinner from '../Spinner'; // Import Spinner for loading state

const CreateEvent = () => {
    const [title, setTitle] = useState('');
    const [eventDate, setEventDate] = useState(''); // Store as YYYY-MM-DD string
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(''); // For success/error messages
    const [isError, setIsError] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');
        setIsError(false);

        const token = localStorage.getItem('token');
        if (!token) {
            setMessage('Authorization error. Please log in again.');
            setIsError(true);
            setIsLoading(false);
            return;
        }

        if (!title || !eventDate) {
            setMessage('Please provide both an event title and a date.');
            setIsError(true);
            setIsLoading(false);
            return;
        }

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            };

            // CORRECTION: Use imported 'api' instance with relative path
            const response = await api.post(
                '/events/create',
                { title, eventDate }, // Send title and date string
                config
            );

            setMessage('Event created successfully!');
            setIsError(false);
            setTitle(''); // Clear form
            setEventDate('');
            // Optional: Navigate back to dashboard after a delay?
            // setTimeout(() => navigate('/'), 1500);

        } catch (err) {
            console.error("Error creating event:", err);
            const errorMsg = err.response?.data?.error || err.message || "Failed to create event.";
            setMessage(errorMsg);
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };

    // Get today's date in YYYY-MM-DD format for the min attribute of date input
    const getTodayDateString = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    return (
        <div className="event-form-wrapper">
            <form className="event-form" onSubmit={handleSubmit}>
                <h2>Create New Event</h2>

                {/* Display Success/Error Message */}
                {message && (
                    <div className={`form-message ${isError ? 'error' : 'success'}`}>
                        {message}
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="title">Event Title</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="eventDate">Event Date</label>
                    <input
                        type="date" // Use date input type
                        id="eventDate"
                        name="eventDate"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        required
                        min={getTodayDateString()} // Prevent selecting past dates
                        disabled={isLoading}
                    />
                </div>

                <button type="submit" disabled={isLoading}>
                    {isLoading ? <Spinner size="small" /> : 'Create Event'}
                </button>
            </form>
        </div>
    );
};

export default CreateEvent;