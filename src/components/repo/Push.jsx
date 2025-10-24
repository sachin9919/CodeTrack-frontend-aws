import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "./repo.css";

const Push = () => {
    const { id: repoId } = useParams();
    const [isPushing, setIsPushing] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState(null);

    const handlePush = async () => {
        setIsPushing(true);
        setError(null);
        setMessage("");

        // --- ADDED: Get token from localStorage ---
        const token = localStorage.getItem('token');
        if (!token) {
            setError("Not authorized. Please log in again.");
            setIsPushing(false);
            return;
        }
        // --- END ADDED ---

        try {
            // --- ADDED: Authorization header ---
            const headers = {
                'Authorization': `Bearer ${token}`
                // Add 'Content-Type': 'application/json' if your backend expects it,
                // but for simple POSTs like this, it might not be needed.
            };
            // --- END ADDED ---

            const response = await fetch(`http://localhost:3000/api/repo/${repoId}/push`, {
                method: "POST",
                headers: headers // --- ADDED headers here ---
            });

            const result = await response.json();

            if (!response.ok) {
                // Handle specific auth error from backend if available
                if (response.status === 401 || response.status === 403) {
                    throw new Error(result.error || "Authorization failed.");
                }
                throw new Error(result.error || "Push failed due to a server error.");
            }

            setMessage(result.message || "Push successful!");
        } catch (err) {
            console.error("Push error:", err);
            setError(err.message || "A network error occurred.");
        } finally {
            setIsPushing(false);
        }
    };

    return (
        <div className="repo-action-page">
            <h2>Push Changes (Repo ID: {repoId})</h2>
            <button onClick={handlePush} disabled={isPushing}>
                {isPushing ? "Pushing..." : "Push to Remote"}
            </button>
            {error && <p style={{ marginTop: "15px", color: 'red' }}>Error: {error}</p>}
            {message && <p style={{ marginTop: "15px", color: 'lightgreen' }}>{message}</p>}
        </div>
    );
};

export default Push;