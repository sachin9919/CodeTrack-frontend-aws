import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// IMPORT THE NEW CENTRAL API CONFIG
import api from "../../api/axiosConfig";
import "./repo.css"; // Uses styles from repo.css

// Removed CLI_API_URL - focus on web API
// const CLI_API_URL = "http://localhost:3000/cli/config"; 

const CreateRepo = () => {
    const [repoData, setRepoData] = useState({
        name: "",
        description: "",
        isPublic: true,
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
        const token = localStorage.getItem("token");

        if (!userId || !token) {
            setError("Authentication error. Please log in again.");
            setIsLoading(false);
            return;
        }

        try {
            // Setup headers for authenticated request
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
                }
            };

            // CORRECTION: Use imported 'api' instance with relative path
            const response = await api.post("/repo/create", {
                name: repoData.name,
                description: repoData.description,
                visibility: repoData.isPublic,
            }, config); // Pass config with token

            // Check response using Axios's structure
            if (response.status !== 201 || !response.data?.repositoryID) {
                throw new Error(response.data?.error || 'Failed to create repository');
            }

            const newRepoId = response.data.repositoryID;

            // Removed the optional CLI config part for simplicity

            navigate(`/repo/${newRepoId}`); // Navigate to the new repo page

        } catch (error) {
            console.error("Repo creation error:", error);
            // Handle Axios specific error structure
            setError(error.response?.data?.error || error.message || "An unexpected error occurred.");
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