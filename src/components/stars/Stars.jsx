import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../explore/explore.css'; // Re-use the CSS from the Explore page

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
                // Use the API endpoint we created earlier
                const response = await axios.get(`http://localhost:3000/api/user/${userId}/starred`, config);

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

            {isLoading && <p className="loading-message">Loading repositories...</p>}
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
                            <h4>{repo.name}</h4>
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