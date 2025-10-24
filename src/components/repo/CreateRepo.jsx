import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./repo.css"; // Uses styles from repo.css

// This URL for the CLI might need to be updated if you create a separate router for it.
// Consider moving CLI related logic to its own controller/router if complex.
const CLI_API_URL = "http://localhost:3000/cli/config"; // Assuming this still exists/works?

const CreateRepo = () => {
    const [repoData, setRepoData] = useState({
        name: "",
        description: "",
        isPublic: true,
        // Removed content and issues, backend initializes these
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false); // Add loading state
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setRepoData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); // Clear previous errors
        setIsLoading(true); // Set loading true

        const userId = localStorage.getItem("userId");
        // --- ADDED: Get token ---
        const token = localStorage.getItem("token");

        if (!userId || !token) { // Check for both userId and token
            setError("Authentication error. Please log in again.");
            setIsLoading(false);
            return;
        }

        try {
            // --- ADDED: Authorization header ---
            const headers = {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            };
            // --- END ADDED ---

            const response = await fetch("http://localhost:3000/api/repo/create", {
                method: "POST",
                headers: headers, // --- USE HEADERS OBJECT ---
                body: JSON.stringify({
                    name: repoData.name,
                    description: repoData.description,
                    visibility: repoData.isPublic,
                    // Backend uses req.user.id for owner, no need to send it from frontend
                    // owner: userId,
                    // Don't send content/issues, backend handles defaults
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new Error(data.error || "Authorization failed.");
                }
                throw new Error(data.error || 'Failed to create repository');
            }

            const newRepoId = data.repositoryID; // Ensure backend sends this key

            // --- Optional: CLI config update ---
            // This part depends heavily on your CLI setup and might not be needed
            // or might need adjustment. Consider removing if unsure.
            try {
                const configUpdateResponse = await fetch(`${CLI_API_URL}/set-repoid`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ repoId: newRepoId })
                });
                if (!configUpdateResponse.ok) {
                    console.warn(`WARNING: Failed to automatically set repoId in local config. HTTP Status: ${configUpdateResponse.status}. You must set it manually in .myGit/config.json.`);
                } else {
                    console.log(`Successfully wrote repoId ${newRepoId} to local config.json.`);
                }
            } catch (cliError) {
                console.warn(`WARNING: Error communicating with local CLI config endpoint: ${cliError.message}. You must set repoId manually in .myGit/config.json.`);
            }
            // --- End Optional CLI part ---

            navigate(`/repo/${newRepoId}`); // Navigate to the new repo page

        } catch (error) {
            console.error("Repo creation error:", error);
            setError(error.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false); // Set loading false
        }
    };

    return (
        // Uses styles from repo.css
        <div className="repo-form-wrapper">
            <form className="repo-form" onSubmit={handleSubmit}>
                <h2>Create New Repository</h2>
                {error && <div className="error-message action-error">Error: {error}</div>} {/* Use action-error style */}
                <div className="form-group"> {/* Added form-group for better structure */}
                    <label htmlFor="name">Repository Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={repoData.name}
                        onChange={handleChange}
                        required
                        disabled={isLoading} // Disable while loading
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={repoData.description}
                        onChange={handleChange}
                        disabled={isLoading}
                    />
                </div>
                <div className="checkbox-row">
                    <input
                        type="checkbox"
                        name="isPublic"
                        checked={repoData.isPublic}
                        onChange={handleChange}
                        id="isPublic"
                        disabled={isLoading}
                    />
                    <label htmlFor="isPublic">Make Public</label>
                </div>
                <button type="submit" disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create"}
                </button>
            </form>
        </div>
    );
};

export default CreateRepo;