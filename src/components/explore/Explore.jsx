import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// REMOVED: import axios from 'axios';
// IMPORT THE NEW CENTRAL API CONFIG
import api from '../../api/axiosConfig';
import './explore.css';
import { RepoIcon } from '@primer/octicons-react'; // Import RepoIcon
import Spinner from "../Spinner"; // Import Spinner

const Explore = () => {
    const [publicRepos, setPublicRepos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPublicRepos = async () => {
            setIsLoading(true); setError('');
            try {
                // CORRECTION: Use imported 'api' instance with relative path
                const response = await api.get('/repo/public');
                if (response.data && Array.isArray(response.data)) { setPublicRepos(response.data); }
                else { console.warn("Received non-array data:", response.data); setPublicRepos([]); }
            } catch (err) {
                console.error("Error fetching public repos:", err); setError(err.response?.data?.error || 'Failed to load.'); setPublicRepos([]);
            } finally { setIsLoading(false); }
        };
        fetchPublicRepos();
    }, []);

    return (
        <div className="explore-page-container">
            <h2>Explore Public Repositories</h2>

            {isLoading && <Spinner />}
            {error && <p className="error-message">Error: {error}</p>}
            {!isLoading && !error && publicRepos.length === 0 && (<p className="no-repos-message">No public repositories found.</p>)}

            {!isLoading && !error && publicRepos.length > 0 && (
                <div className="repo-list-container">
                    {publicRepos.map((repo) => (
                        <div
                            key={repo._id}
                            className="repo-card explore-card clickable" // Uses explore-card styles
                            onClick={() => navigate(`/repo/${repo._id}`)}
                            title={`View repository: ${repo.name}`}
                        >
                            {/* Added Icon */}
                            <h4><RepoIcon size={16} verticalAlign="middle" /> {repo.name}</h4>
                            <p className="repo-description">{repo.description || 'No description provided.'}</p>
                            <div className="repo-meta-explore">
                                <span className="repo-owner"> By:{' '} {repo.owner?._id ? (<Link to={`/profile/${repo.owner._id}`} onClick={(e) => e.stopPropagation()} className="owner-link" title={`View ${repo.owner.username}'s profile`}> {repo.owner.username || 'Unknown'} </Link>) : ('Unknown')} </span>
                                <span className="repo-created-date"> Created: {new Date(repo.createdAt).toLocaleDateString()} </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Explore;