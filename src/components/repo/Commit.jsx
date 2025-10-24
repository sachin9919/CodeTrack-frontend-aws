import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./repo.css"; // Assuming shared repo CSS

const Commit = () => {
    const { id: repoId } = useParams(); // Use repoId for clarity
    const navigate = useNavigate();
    const [message, setMessage] = useState("");
    // FIX 1: Add state for the content textarea
    const [content, setContent] = useState("");
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCommit = async () => {
        setError(null);
        setIsSubmitting(true);

        const commitMessage = message.trim();
        const fileContent = content; // Get content state
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem('token'); // Get token for auth

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
            const config = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: commitMessage,
                    userId: userId,
                    // FIX 2: Send the content state in the request body
                    content: fileContent,
                }),
            };
            // Add Authorization header if token exists
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`http://localhost:3000/api/repo/${repoId}/commit`, config);
            const result = await response.json();

            if (response.ok) {
                console.log("Commit successful:", result);
                // Optionally show success message before navigating
                navigate(`/repo/${repoId}`); // Navigate back to repo details
            } else {
                setError(result.error || result.message || "Commit failed");
            }
        } catch (err) {
            console.error("Commit error:", err);
            setError("Error communicating with the server during commit.");
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

            {/* FIX 3: Add Textarea for Content */}
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