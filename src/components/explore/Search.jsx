import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './explore.css'; // Uses explore.css
import { RepoIcon } from '@primer/octicons-react'; // Import RepoIcon
import Spinner from "../Spinner"; // Import Spinner
// Optional: Import PersonIcon if you want user icons
// import { PersonIcon } from '@primer/octicons-react';

const Search = () => {
    const [results, setResults] = useState({ users: [], repositories: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const query = searchParams.get('q');

    useEffect(() => {
        if (!query) { setIsLoading(false); setResults({ users: [], repositories: [] }); return; }
        const fetchResults = async () => {
            setIsLoading(true); setError('');
            try {
                // Search might need auth if it searches private repos in future
                const token = localStorage.getItem('token');
                const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
                const response = await axios.get(`http://localhost:3000/api/search?q=${query}`, config);
                setResults(response.data);
            } catch (err) {
                console.error("Error fetching search results:", err); setError(err.response?.data?.error || 'Failed to load search results.'); setResults({ users: [], repositories: [] });
            } finally { setIsLoading(false); }
        };
        fetchResults();
    }, [query]);

    const totalResults = results.users.length + results.repositories.length;

    return (
        <div className="explore-page-container"> {/* Uses explore container style */}
            {isLoading && <Spinner />}
            {error && <p className="error-message">Error: {error}</p>}

            {!isLoading && !error && (
                <>
                    <h2>Search Results for "{query}"</h2>
                    <p className="results-count">{totalResults} result{totalResults !== 1 ? 's' : ''} found</p>

                    {/* Repository Results */}
                    {results.repositories.length > 0 && (
                        <div className="search-results-section">
                            <h3>Repositories</h3>
                            <div className="repo-list-container"> {/* Uses explore grid layout */}
                                {results.repositories.map((repo) => (
                                    <div
                                        key={repo._id}
                                        className="repo-card explore-card clickable" // Uses explore card style
                                        onClick={() => navigate(`/repo/${repo._id}`)}
                                        title={`View repository: ${repo.name}`}
                                    >
                                        {/* Added Icon */}
                                        <h4><RepoIcon size={16} verticalAlign="middle" /> {repo.name}</h4>
                                        <p className="repo-description">{repo.description || 'No description provided.'}</p>
                                        <div className="repo-meta-explore">
                                            <span className="repo-owner"> By:{' '} <Link to={`/profile/${repo.owner?._id}`} onClick={(e) => e.stopPropagation()} className="owner-link" title={`View ${repo.owner?.username}'s profile`}> {repo.owner?.username || 'Unknown'} </Link> </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* User Results */}
                    {results.users.length > 0 && (
                        <div className="search-results-section">
                            <h3>Users</h3>
                            <div className="repo-list-container">
                                {results.users.map((user) => (
                                    <div
                                        key={user._id}
                                        className="repo-card explore-card clickable user-card" // Can add specific user-card class if needed
                                        onClick={() => navigate(`/profile/${user._id}`)}
                                        title={`View profile: ${user.username}`}
                                    >
                                        {/* Optional: Add a user icon */}
                                        {/* <h4><PersonIcon size={16} verticalAlign="middle"/> {user.username}</h4> */}
                                        <h4>{user.username}</h4>
                                        {/* Could add user avatar here if API provides it */}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* No Results Message */}
                    {totalResults === 0 && (<p className="no-repos-message">No repositories or users found.</p>)}
                </>
            )}
        </div>
    );
};

export default Search;