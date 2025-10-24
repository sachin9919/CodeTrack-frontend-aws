import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./repo.css";

const Issues = () => {
    const { id } = useParams(); // This is the repoId
    const [issues, setIssues] = useState([]);
    const [newIssue, setNewIssue] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Moved token retrieval outside useEffect for reuse
    const token = localStorage.getItem('token');
    const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};

    const fetchIssues = async () => {
        setLoading(true);
        setError(null);
        if (!token) { // Check token early for GET request
            setError("Not authorized to view issues. Please log in.");
            setLoading(false);
            setIssues([]);
            return;
        }
        try {
            const response = await fetch(`http://localhost:3000/api/repo/${id}/issues`, {
                headers: authHeaders // --- ADDED headers ---
            });
            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new Error(data.error || "Authorization failed.");
                }
                throw new Error(data.error || "Failed to fetch issues.");
            }
            setIssues(data);
        } catch (err) {
            console.error("Error fetching issues:", err);
            setError(err.message);
            setIssues([]); // Clear issues on error
        } finally {
            setLoading(false);
        }
    };

    // Fetch issues on component mount or when repo ID changes
    useEffect(() => {
        fetchIssues();
    }, [id, token]); // Added token as dependency, though fetchIssues checks it


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newIssue.trim()) return;

        setError(null);
        if (!token) { // Check token before POST request
            setError("Not authorized to create issues. Please log in.");
            return;
        }
        try {
            // Combine auth header with content type header
            const postHeaders = {
                ...authHeaders,
                "Content-Type": "application/json"
            };

            const response = await fetch(`http://localhost:3000/api/repo/${id}/issues`, {
                method: "POST",
                headers: postHeaders, // --- Use combined headers ---
                body: JSON.stringify({
                    content: newIssue,
                    // Assuming backend gets author from token via 'protect' middleware
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new Error(data.error || "Authorization failed.");
                }
                throw new Error(data.error || "Failed to create issue.");
            }

            // Refresh issues list after successful creation
            // Alternatively, add the new issue directly to state: setIssues(prev => [data, ...prev]);
            fetchIssues(); // Re-fetch to get the updated list including the new one
            setNewIssue(""); // Clear the input box
        } catch (err) {
            console.error("Issue creation error:", err);
            setError(err.message || "Network error during issue submission.");
        }
    };

    return (
        <div className="repo-action-page">
            <h2>Issues for This Repository (Repo ID: {id})</h2>

            {error && <p style={{ color: "red", marginBottom: "15px" }}>Error: {error}</p>}

            <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
                <textarea
                    placeholder="Describe the issue..."
                    value={newIssue}
                    onChange={(e) => setNewIssue(e.target.value)}
                    rows={3}
                    style={{ width: "100%", padding: "10px", borderRadius: "4px" }}
                    disabled={!token} // Disable if not logged in
                />
                <button type="submit" disabled={!token}>Create Issue</button>
            </form>

            {loading ? (
                <p>Loading issues...</p>
            ) : (
                <ul>
                    {issues.length === 0 && !error && <p>No issues found.</p>}
                    {issues.map((issue) => (
                        <li key={issue._id} style={{ marginBottom: "10px", borderBottom: '1px solid #333', paddingBottom: '5px' }}>
                            <p>{issue.content}</p>
                            <small style={{ color: '#888' }}>
                                Opened on {new Date(issue.createdAt).toLocaleString()}
                            </small>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Issues;