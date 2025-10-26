import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig"; // IMPORTED CENTRAL API
import "./repo.css"; // Assuming shared repo CSS

const Commit = () => {
    const { id: repoId } = useParams(); // Use repoId for clarity
    const navigate = useNavigate();
    const [message, setMessage] = useState("");
    const [content, setContent] = useState("");
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCommit = async () => {
        setError(null);
        setIsSubmitting(true);

        const commitMessage = message.trim();
        const fileContent = content;
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem('token');

        if (!commitMessage) {
            setError("Commit message cannot be empty");
            setIsSubmitting(false);
            return;
        }
        if (!userId) {
            setError("Cannot commit: User not logged in.");
            setIsSubmitting(false);
            return;
        }

        try {
            // Setup headers for authenticated request
            const config = {
                headers: {
                    // 'Content-Type' is already set in api config
                    'Authorization': `Bearer ${token}`
                }
            };

            // Data payload
            const payload = {
                message: commitMessage,
                userId: userId,
                content: fileContent,
            };

            // --- CORRECTION: Use api.post and relative URL ---
            const response = await api.post(`/repo/${repoId}/commit`, payload, config);

            // Axios response check (status 200 or 201 is usually success)
            if (response.status === 200 || response.status === 201) {
                console.log("Commit successful:", response.data);
                navigate(`/repo/${repoId}`); // Navigate back to repo details
            } else {
                // This else might not be hit if Axios throws on bad status
                setError(response.data.error || response.data.message || "Commit failed");
            }
        } catch (err) {
            console.error("Commit error:", err);
            // Axios error structure
            setError(err.response?.data?.error || err.message || "Error communicating with the server.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="repo-action-page commit-page"> {/* Added specific class */}
            <h2>Commit Changes to Repository</h2>
            {error && <div className="error-message action-error">Error: {error}</div>}

            {/* Commit Message Input */}
            <div className="form-group">
                <label htmlFor="commit-message">Commit Message</label>
                <input
                    id="commit-message"
                    type="text"
                    placeholder="Enter commit message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
            </div>

            {/* Textarea for Content */}
            <div className="form-group">
                <label htmlFor="commit-content">File Content (e.g., README)</label>
                <textarea
                    id="commit-content"
                    placeholder="Enter file content..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={10} // Adjust rows as needed
                />
            </div>

            <button onClick={handleCommit} disabled={isSubmitting}>
                {isSubmitting ? "Committing..." : "Commit Changes"}
            </button>
        </div>
    );
};

export default Commit;