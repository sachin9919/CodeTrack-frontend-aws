import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "./repo.css";

const Pull = () => {
    const { id: repoId } = useParams();
    const [isPulling, setIsPulling] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState(null);

    const handlePull = async () => {
        setIsPulling(true);
        setError(null);
        setMessage("");

        // --- ADDED: Get token from localStorage ---
        const token = localStorage.getItem('token');
        if (!token) {
            setError("Not authorized. Please log in again.");
            setIsPulling(false);
            return;
        }
        // --- END ADDED ---

        try {
            // --- ADDED: Authorization header ---
            const headers = {
                'Authorization': `Bearer ${token}`
            };
            // --- END ADDED ---

            const response = await fetch(`http://localhost:3000/api/repo/${repoId}/pull`, {
                method: "POST",
                headers: headers // --- ADDED headers here ---
            });

            const result = await response.json();

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new Error(result.error || "Authorization failed.");
                }
                throw new Error(result.error || "Pull failed due to a server error.");
            }

            setMessage(result.message || "Pull successful!");
        } catch (err) {
            console.error("Pull error:", err);
            setError(err.message || "A network error occurred.");
        } finally {
            setIsPulling(false);
        }
    };

    return (
        <div className="repo-action-page">
            <h2>Pull Latest Changes (Repo ID: {repoId})</h2>
            <button onClick={handlePull} disabled={isPulling}>
                {isPulling ? "Pulling..." : "Pull from Remote"}
            </button>
            {error && <p style={{ marginTop: "15px", color: 'red' }}>Error: {error}</p>}
            {message && <p style={{ marginTop: "15px", color: 'lightgreen' }}>{message}</p>}
        </div>
    );
};

export default Pull;