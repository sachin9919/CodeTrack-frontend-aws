import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// REMOVED: import axios from 'axios';
// IMPORT THE NEW CENTRAL API CONFIG
import api from '../../api/axiosConfig';
import '../explore/explore.css'; // Re-use the CSS from the Explore page
import { RepoIcon } from '@primer/octicons-react'; // Import RepoIcon
import Spinner from '../Spinner'; // Import Spinner

const Stars = () => {
    const [starredRepos, setStarredRepos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStarredRepos = async () => {
            setIsLoading(true);
            setError('');

            const userId = localStorage.getItem('userId');
            const token = localStorage.getItem('token');

            if (!userId || !token) {
                setError('You must be logged in to see your starred repositories.');
                setIsLoading(false);
                return;
            }

            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                // CORRECTION: Use imported 'api' instance with relative path
                const response = await api.get(`/user/${userId}/starred`, config);

                if (response.data && Array.isArray(response.data)) {
                    setStarredRepos(response.data);
                } else {
                    console.warn("Received non-array data for starred repos:", response.data);
                    setStarredRepos([]);
                }
            } catch (err) {
                console.error("Error fetching starred repositories:", err);
                setError(err.response?.data?.error || 'Failed to load starred repositories.');
                setStarredRepos([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStarredRepos();
    }, []); // Run only once on component mount

    return (
        // We use the exact same class names as Explore.jsx to share the style
        <div className="explore-page-container">
            <h2>Your Starred Repositories</h2>

            {isLoading && <Spinner />} {/* Use Spinner component */}
            {error && <p className="error-message">Error: {error}</p>}

            {!isLoading && !error && starredRepos.length === 0 && (
                <p className="no-repos-message">You haven't starred any repositories yet.</p>
            )}

            {!isLoading && !error && starredRepos.length > 0 && (
                <div className="repo-list-container">
                    {starredRepos.map((repo) => (
                        <div
                            key={repo._id}
                            className="repo-card explore-card clickable"
                            onClick={() => navigate(`/repo/${repo._id}`)}
                            title={`View repository: ${repo.name}`}
                        >
                            {/* Added Icon */}
                            <h4><RepoIcon size={16} verticalAlign="middle" /> {repo.name}</h4>
                            <p className="repo-description">{repo.description || 'No description provided.'}</p>
                            <div className="repo-meta-explore">
                                <span className="repo-owner">
                                    By:{' '}
                                    {repo.owner?._id ? (
                                        <Link
                                            to={`/profile/${repo.owner._id}`}
                                            onClick={(e) => e.stopPropagation()} // Prevent card click
                                            className="owner-link"
                                            title={`View ${repo.owner.username}'s profile`}
                                        >
                                            {repo.owner.username || 'Unknown'}
                                        </Link>
                                    ) : (
                                        'Unknown'
                                    )}
                                </span>
                                <span className="repo-created-date">
                                    Created: {new Date(repo.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Stars;