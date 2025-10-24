import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from 'axios';
import "./repo.css";
import { StarIcon } from '@primer/octicons-react';

const RepoDetails = () => {
    const { id: repoId } = useParams();
    const navigate = useNavigate();
    const [repo, setRepo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editingDescription, setEditingDescription] = useState(false);
    const [newDescription, setNewDescription] = useState("");
    const [pageError, setPageError] = useState(null);
    const loggedInUserId = localStorage.getItem("userId");
    const [isStarred, setIsStarred] = useState(false);
    const [starLoading, setStarLoading] = useState(false);

    const fetchRepoDetails = useCallback(async (isInitialLoad = true) => {
        if (isInitialLoad) setLoading(true);
        setPageError(null);
        try {
            const token = localStorage.getItem('token');
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

            const [repoResponse, userResponse] = await Promise.all([
                fetch(`http://localhost:3000/api/repo/${repoId}`, config),
                loggedInUserId ? fetch(`http://localhost:3000/api/user/userProfile/${loggedInUserId}`, config) : Promise.resolve(null)
            ]);

            const repoData = await repoResponse.json();
            const userData = userResponse ? await userResponse.json() : null;

            if (!repoResponse.ok || !repoData?._id) { throw new Error(repoData.error || `Repo not found (Status: ${repoResponse.status})`); }

            setRepo(repoData);
            setNewDescription(repoData.description || "");

            if (userData?.starRepos?.includes(repoId)) { setIsStarred(true); }
            else { setIsStarred(false); }

            if (isInitialLoad) setPageError(null);
            return repoData;

        } catch (err) {
            console.error("Error fetching repository details:", err);
            setPageError(err.message || "Network error.");
            setRepo(null); setIsStarred(false); return null;
        } finally { if (isInitialLoad) setLoading(false); }
    }, [repoId, loggedInUserId]);

    useEffect(() => { fetchRepoDetails(true); }, [fetchRepoDetails]);

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this repository? This action cannot be undone.")) { return; }
        setPageError(null);
        const token = localStorage.getItem('token');
        try {
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const response = await fetch(`http://localhost:3000/api/repo/delete/${repoId}`, { // Use repoId
                method: "DELETE",
                headers: config.headers,
            });
            const data = await response.json();
            if (response.ok) { navigate("/", { replace: true }); }
            else { throw new Error(data.error || "Failed to delete repository"); }
        } catch (err) {
            console.error("Deletion error:", err);
            setPageError(err.message || "Error communicating with the server during deletion.");
        }
    };
    const toggleVisibility = async () => {
        setPageError(null);
        const token = localStorage.getItem('token');
        try {
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const response = await fetch(`http://localhost:3000/api/repo/toggle/${repoId}`, { // Use repoId
                method: "PATCH",
                headers: config.headers,
            });
            const data = await response.json();
            if (response.ok && data.repository) { setRepo(data.repository); }
            else { throw new Error(data.error || "Failed to toggle visibility"); }
        } catch (err) {
            console.error("Error toggling visibility:", err);
            setPageError(err.message || "Error communicating with the server.");
        }
    };
    const handleDescriptionUpdate = async () => {
        setPageError(null);
        const token = localStorage.getItem('token');
        try {
            const config = token ? { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } } : { headers: { 'Content-Type': 'application/json' } };
            const response = await fetch(`http://localhost:3000/api/repo/update/${repoId}`, { // Use repoId
                method: "PUT",
                headers: config.headers,
                body: JSON.stringify({ description: newDescription }),
            });
            const data = await response.json();
            if (response.ok && data.repository) { setRepo(data.repository); setEditingDescription(false); }
            else { throw new Error(data.error || "Update failed"); }
        } catch (err) {
            console.error("Update error:", err);
            setPageError(err.message || "Error communicating with the server.");
        }
    };
    const showNotOwnerAlert = (action) => { alert(`You are not the owner of this repository and cannot perform the '${action}' action.`); };

    // Handle star/unstar toggle
    const handleStarToggle = async () => {
        if (!loggedInUserId) { alert("Please log in to star repositories."); return; };
        setStarLoading(true);
        setPageError(null);
        const action = isStarred ? 'unstar' : 'star';
        const url = `http://localhost:3000/api/user/${action}/${repoId}`; // Use repoId
        const token = localStorage.getItem('token');
        try {
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const response = await axios.post(url, {}, config);
            if (response.data) { console.log(response.data.message); setIsStarred(!isStarred); }
        } catch (err) {
            console.error(`Error ${action}ing repo:`, err);
            setPageError(err.response?.data?.error || `Failed to ${action}.`);
        } finally { setStarLoading(false); }
    };

    const isOwner = repo?.owner?._id === loggedInUserId;

    // --- Render Logic ---
    if (loading) return <div style={{ color: "white", padding: "20px" }}>Loading repository details...</div>;
    if (pageError && !repo) return <div className="action-error page-error">Error: {pageError}</div>;
    if (!repo) return <div style={{ color: "white", padding: "20px" }}>Repository not found or could not be loaded.</div>;

    return (
        <div className="repo-details-page">
            {pageError && <div className="action-error">Error: {pageError}</div>}
            <div className="repo-header">
                <h2>{repo.name}</h2>
                <button
                    onClick={handleStarToggle}
                    disabled={starLoading || !loggedInUserId}
                    className={`star-button ${isStarred ? 'starred' : ''}`}
                    title={loggedInUserId ? (isStarred ? "Unstar this repository" : "Star this repository") : "Log in to star"}
                >
                    <StarIcon size={16} />
                    {starLoading ? '...' : (isStarred ? 'Unstar' : 'Star')}
                </button>
                {isOwner && editingDescription ? (
                    <>
                        {/* Added save-desc and cancel-desc classes for styling flexibility */}
                        <textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} rows={3} />
                        <button onClick={handleDescriptionUpdate} className="primary-action-button save-desc">Save Description</button>
                        <button onClick={() => setEditingDescription(false)} className="secondary-action-button cancel-desc">Cancel</button>
                    </>
                ) : (
                    <>
                        <p className="repo-description-text">{repo.description || "No description provided."}</p>
                        {isOwner && <button onClick={() => setEditingDescription(true)} className="secondary-action-button edit-desc">Edit Description</button>}
                    </>
                )}
            </div>
            <div className="repo-meta">
                <p><strong>Visibility:</strong> <span className={`visibility-status ${repo.visibility ? 'public' : 'private'}`}>{repo.visibility ? "Public" : "Private"}</span></p>
                <p><strong>Owner:</strong>{' '} {repo.owner?._id ? (<Link to={`/profile/${repo.owner._id}`} className="owner-link">{repo.owner.username || "Unknown"}</Link>) : ("Unknown")}</p>
                <p><strong>Created At:</strong> {new Date(repo.createdAt).toLocaleString()}</p>
                {/* Applied secondary-action-button class */}
                {isOwner && <button onClick={toggleVisibility} className="secondary-action-button toggle-visibility-btn">Toggle Visibility</button>}
            </div>

            {/* Display Latest Content */}
            <div className="repo-latest-content">
                <h3>Latest Content (e.g., README)</h3>
                {repo.latestContent ? (
                    <pre className="content-display">{repo.latestContent}</pre>
                ) : (
                    <p className="no-content-message">No content has been committed yet.</p>
                )}
            </div>

            <div className="repo-content">
                <h3>Commit History:</h3>
                {repo.content && repo.content.length === 0 ? (<p>No commits yet.</p>) : (<ul>{(repo.content || []).map((entry, idx) => (<li key={entry._id || idx}>{entry?.message || 'Commit entry invalid'}</li>))}</ul>)}
            </div>
            {/* Action Buttons Section */}
            <div className="repo-actions">
                {/* Used primary-action-button for Commit to emphasize it as the main action */}
                <button
                    onClick={() => isOwner ? navigate(`/repo/${repoId}/commit`) : showNotOwnerAlert('Commit')}
                    className={`primary-action-button commit-btn ${!isOwner ? 'disabled-button' : ''}`}
                    disabled={!isOwner}
                >
                    Commit
                </button>
                {/* Used secondary-action-button for less critical actions */}
                <button
                    onClick={() => isOwner ? navigate(`/repo/${repoId}/push`) : showNotOwnerAlert('Push')}
                    className={`secondary-action-button push-btn ${!isOwner ? 'disabled-button' : ''}`}
                    disabled={!isOwner}
                >
                    Push
                </button>
                <button
                    onClick={() => isOwner ? navigate(`/repo/${repoId}/pull`) : showNotOwnerAlert('Pull')}
                    className={`secondary-action-button pull-btn ${!isOwner ? 'disabled-button' : ''}`}
                    disabled={!isOwner}
                >
                    Pull
                </button>
                <button onClick={() => navigate(`/repo/${repoId}/issues`)} className="secondary-action-button issues-btn">View Issues</button>
                {/* Used delete-button for the destructive action */}
                {isOwner && <button onClick={handleDelete} className="delete-button">Delete Repository</button>}
            </div>
        </div>
    );
};

export default RepoDetails;