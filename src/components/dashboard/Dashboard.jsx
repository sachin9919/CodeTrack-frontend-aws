import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./dashboard.css";
import AnalogClock from "./AnalogClock";
import { RepoIcon } from '@primer/octicons-react'; // Import RepoIcon
import Spinner from "../Spinner"; // Import Spinner

const Dashboard = () => {
  const [repositories, setRepositories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestedRepositories, setSuggestedRepositories] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState('');

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem('token');
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

    const fetchRepositories = async () => {
      if (!userId) { setIsLoading(false); setRepositories([]); return; }
      setIsLoading(true);
      try {
        const response = await axios.get(`http://localhost:3000/api/repo/user/${userId}`, config);
        setRepositories(response.data.repositories || []);
      } catch (err) {
        console.error("Error fetching user repositories:", err); setRepositories([]);
      } finally { setIsLoading(false); }
    };

    const fetchSuggestedRepositories = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/repo/public", config);
        setSuggestedRepositories(response.data || []);
      } catch (err) { console.error("Error fetching suggested repositories:", err); setSuggestedRepositories([]); }
    };

    const fetchEvents = async () => {
      setEventsLoading(true); setEventsError('');
      try {
        const response = await axios.get("http://localhost:3000/api/events/upcoming", config);
        setEvents(response.data || []);
      } catch (err) {
        console.error("Error fetching upcoming events:", err); setEventsError("Could not load events."); setEvents([]);
      } finally { setEventsLoading(false); }
    };

    fetchRepositories();
    fetchSuggestedRepositories();
    fetchEvents();

  }, []);

  // Client-side search logic for user's repos
  useEffect(() => {
    if (searchQuery === "") {
      setSearchResults(repositories);
    } else {
      const filteredRepo = repositories.filter((repo) =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filteredRepo);
    }
  }, [searchQuery, repositories]);

  const currentUserId = localStorage.getItem("userId");

  if (!currentUserId) {
    return (
      <div style={{ color: 'white', padding: '50px', textAlign: 'center' }}>
        <h2>You are not logged in.</h2>
        <p>Please log in to view and manage your repositories.</p>
      </div>
    );
  }

  // Helper function to format event dates
  const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); // e.g., "Dec 15"
  };

  return (
    <section id="dashboard">
      <aside className="left-panel">
        <h3>Suggested Public Repositories</h3>
        {suggestedRepositories.length === 0 && <p className="no-items-message small">No public repositories found.</p>}
        {suggestedRepositories.map((repo) => (
          <div
            key={repo._id}
            className="repo-card clickable"
            onClick={() => navigate(`/repo/${repo._id}`)}
            title={`Go to repository: ${repo.name}`}
          >
            {/* Added Icon */}
            <h4><RepoIcon size={16} verticalAlign="middle" /> {repo.name}</h4>
            <p className="repo-description">{repo.description || 'No description.'}</p>
            <p className="repo-meta">
              {repo.visibility ? "Public" : "Private"} | By{' '}
              {repo.owner?._id ? (
                <Link
                  to={`/profile/${repo.owner._id}`}
                  className="owner-link"
                  onClick={(e) => e.stopPropagation()}
                  title={`View ${repo.owner.username}'s profile`}
                >
                  {repo.owner.username || "Unknown"}
                </Link>
              ) : (
                "Unknown"
              )}
            </p>
          </div>
        ))}
      </aside>

      <main className="main-content">
        <h2>Your Repositories</h2>
        <div id="search">
          <input
            type="text"
            value={searchQuery}
            placeholder="Search your repositories..."
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* --- USE SPINNER for User Repos --- */}
        {isLoading && <Spinner />}

        {!isLoading && searchResults.length === 0 && searchQuery && <p className="no-items-message">No repositories match your search.</p>}
        {!isLoading && repositories.length === 0 && !searchQuery && <p className="no-items-message">You haven't created any repositories yet.</p>}

        {!isLoading && searchResults.map((repo) => (
          <div
            key={repo._id}
            className="repo-card clickable"
            onClick={() => navigate(`/repo/${repo._id}`)}
            title={`Go to repository: ${repo.name}`}
          >
            {/* Added Icon */}
            <h4><RepoIcon size={16} verticalAlign="middle" /> {repo.name}</h4>
            <p className="repo-description">{repo.description || 'No description.'}</p>
            <p className="repo-meta">
              {repo.visibility ? "Public" : "Private"}
            </p>
          </div>
        ))}
      </main>

      <aside className="right-panel">
        <AnalogClock />
        <div className="panel-header-link">
          <h3>Upcoming Events</h3>
          {/* --- ADDED LINK TO CREATE EVENT PAGE --- */}
          <Link to="/create-event" className="add-event-link" title="Add New Event">+</Link>
        </div>
        {eventsLoading && <Spinner size="small" />}

        {eventsError && <p className="error-message small">{eventsError}</p>}
        {!eventsLoading && !eventsError && events.length === 0 && <p className="no-items-message small">No upcoming events.</p>}
        {!eventsLoading && !eventsError && events.length > 0 && (
          <ul className="event-list">
            {events.map((event) => (
              <li key={event._id}>
                <span className="event-title">{event.title}</span> - <span className="event-date">{formatEventDate(event.eventDate)}</span>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </section>
  );
};

export default Dashboard;