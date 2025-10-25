import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
// REMOVED: import axios from "axios";
// IMPORT THE NEW CENTRAL API CONFIG
import api from "../../api/axiosConfig";
import "./profile.css";
import { UnderlineNav } from "@primer/react";
import { BookIcon, RepoIcon } from "@primer/octicons-react"; // RepoIcon imported
import HeatMapProfile from "./HeatMap";
import { useAuth } from "../../authContext";
import Spinner from "../Spinner"; // Import Spinner

const Profile = () => {
  const navigate = useNavigate();
  const params = useParams();
  const profileUserId = params.id || localStorage.getItem("userId");
  const loggedInUserId = localStorage.getItem("userId");

  const [userDetails, setUserDetails] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Main profile loading
  const [followLoading, setFollowLoading] = useState(false);
  const [error, setError] = useState('');
  const { setCurrentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [starredRepos, setStarredRepos] = useState(null);
  const [isStarredLoading, setIsStarredLoading] = useState(false); // Specific loading for starred

  // Fetches main user profile details
  const fetchUserDetails = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) { setIsLoading(true); setError(''); setUserDetails(null); setIsFollowing(false); }
    else { setError(''); }
    if (!profileUserId) { setError('User ID could not be determined.'); if (isInitialLoad) setIsLoading(false); return null; }
    try {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      // CORRECTION: Use imported 'api' instance with relative path
      const response = await api.get(`/user/userProfile/${profileUserId}`, config);
      console.log("Fetched user details:", response.data, `Received followerCount: ${response.data?.followerCount}`);
      if (response.data && response.data._id) { return response.data; }
      else { setError('Received invalid user data.'); return null; }
    } catch (err) {
      console.error("Cannot fetch user details: ", err);
      const backendError = err.response?.data?.message || err.response?.data?.error || 'Failed to load profile.';
      setError(backendError); return null;
    } finally { if (isInitialLoad) setIsLoading(false); }
  }, [profileUserId]);

  // Load initial profile data on mount or when ID changes
  useEffect(() => {
    const loadData = async () => {
      const data = await fetchUserDetails(true);
      if (data) {
        setUserDetails(data);
        setIsFollowing(data.isFollowing || false);
        if (data._id === loggedInUserId) {
          localStorage.setItem('avatarUrl', data.avatarUrl || '');
          window.dispatchEvent(new Event('avatarUpdated'));
        }
      }
    };
    loadData();
  }, [fetchUserDetails, loggedInUserId]);

  // Fetches starred repos only when the 'starred' tab is active
  useEffect(() => {
    if (activeTab === 'starred' && !starredRepos) {
      const fetchStarredRepos = async () => {
        setIsStarredLoading(true);
        setError(''); // Clear errors from previous tab/load
        try {
          const token = localStorage.getItem('token');
          const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
          // CORRECTION: Use imported 'api' instance with relative path
          const response = await api.get(`/user/${profileUserId}/starred`, config);
          setStarredRepos(response.data || []);
        } catch (err) {
          console.error("Cannot fetch starred repos: ", err);
          const backendError = err.response?.data?.message || err.response?.data?.error || 'Failed to load starred repositories.';
          setError(backendError);
          setStarredRepos([]); // Ensure it's an empty array on error
        } finally {
          setIsStarredLoading(false);
        }
      };
      fetchStarredRepos();
    }
  }, [activeTab, starredRepos, profileUserId]); // Dependencies

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("avatarUrl");
    if (setCurrentUser) setCurrentUser(null);
    navigate("/auth");
  };

  const handleFollowToggle = async () => {
    if (!loggedInUserId || loggedInUserId === profileUserId) return;
    setFollowLoading(true); setError('');
    const action = isFollowing ? 'unfollow' : 'follow';
    // CORRECTION: Use imported 'api' instance with relative path
    const url = `/user/${action}/${profileUserId}`;
    const token = localStorage.getItem('token');
    try {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const response = await api.post(url, {}, config); // Use api.post
      if (response.data) {
        console.log(response.data.message);
        // Refresh profile details to get updated follower count and isFollowing status
        const updatedUserDetails = await fetchUserDetails(false);
        if (updatedUserDetails) {
          setUserDetails(updatedUserDetails);
          setIsFollowing(updatedUserDetails.isFollowing || false);
        } else { setError('Failed to refresh profile after follow action.'); }
      }
    } catch (err) {
      console.error(`Error ${action}ing user:`, err);
      const followError = err.response?.data?.error || `Failed to ${action}.`;
      setError(followError);
    } finally { setFollowLoading(false); }
  };

  // --- Render Loading State ---
  if (isLoading) {
    return <Spinner />;
  }

  // --- Render Error State (if main profile load failed) ---
  if (error && !userDetails) {
    return <div className="error-message page-error">
      {`Error: ${error || 'Could not load user profile.'}`}
    </div>;
  }

  // --- Render Null if no user details ---
  if (!userDetails) {
    return null;
  }

  const isOwnProfile = loggedInUserId === profileUserId;

  // --- Reusable Repo List Renderer ---
  const renderRepoList = (repos, listTitle, noReposMessage) => {
    return (
      <div className="profile-repos-section">
        <h4>{listTitle}</h4>
        {repos && repos.length > 0 ? (
          <ul className="profile-repo-list">
            {repos.map(repo => (
              <li key={repo._id} className="profile-repo-item">
                <Link to={`/repo/${repo._id}`}>
                  {/* Added Icon */}
                  <RepoIcon size={16} verticalAlign="middle" />
                  {activeTab === 'starred' && repo.owner && repo.owner.username !== userDetails.username && (
                    <span className="repo-owner-prefix">{repo.owner.username} / </span>
                  )}
                  {repo.name}
                </Link>
                <p>{repo.description || 'No description'}</p>
                <span>{repo.visibility ? 'Public' : 'Private'}</span>
              </li>
            ))}
          </ul>
        ) : (<p className="no-repos-message">{noReposMessage}</p>)}
      </div>
    );
  };

  // --- Main Render ---
  return (
    <>
      <UnderlineNav aria-label="Profile Tabs" className="profile-tabs"> {/* Added class */}
        <UnderlineNav.Item
          as="button" // Use button for accessibility
          onClick={() => setActiveTab('overview')}
          aria-current={activeTab === 'overview' ? 'page' : undefined}
          icon={BookIcon}
          className="profile-tab-item" // Added class
        >
          Overview
        </UnderlineNav.Item>
        <UnderlineNav.Item
          as="button"
          onClick={() => setActiveTab('starred')}
          aria-current={activeTab === 'starred' ? 'page' : undefined}
          icon={RepoIcon}
          className="profile-tab-item" // Added class
        >
          Starred Repositories
        </UnderlineNav.Item>
      </UnderlineNav>

      <div className="profile-page-wrapper">
        {/* --- LEFT SIDEBAR (User Info) --- */}
        <div className="user-profile-section">
          <div className="profile-image">
            {userDetails.avatarUrl ? (
              <img src={userDetails.avatarUrl} alt={`${userDetails.username}'s avatar`} />
            ) : (
              <div className="profile-image-placeholder"></div>
            )}
          </div>
          <div className="name">
            <h3>{userDetails.username}</h3>
          </div>
          {!isOwnProfile && (
            <button
              className={`follow-btn ${isFollowing ? 'following' : ''}`}
              onClick={handleFollowToggle}
              disabled={followLoading}
            >
              {followLoading ? '...' : (isFollowing ? 'Unfollow' : 'Follow')}
            </button>
          )}
          <div className="follower">
            <p><strong>{userDetails.followerCount ?? 0}</strong> Followers</p>
            <p><strong>{userDetails.followingCount ?? 0}</strong> Following</p>
          </div>
        </div>

        {/* --- MAIN CONTENT (Tabs) --- */}
        <div className="profile-main-content">
          {/* --- OVERVIEW TAB CONTENT --- */}
          {activeTab === 'overview' && (
            <>
              <div className="heat-map-section"><HeatMapProfile /></div>
              {renderRepoList(
                userDetails.repositories,
                isOwnProfile ? 'Your Repositories' : `${userDetails.username}'s Repositories`,
                'No repositories found.'
              )}
            </>
          )}

          {/* --- STARRED REPOS TAB CONTENT --- */}
          {activeTab === 'starred' && (
            <>
              {/* --- USE SMALL SPINNER for Starred Loading --- */}
              {isStarredLoading && <Spinner size="small" />}

              {error && !isStarredLoading && <p className="error-message">{`Error: ${error}`}</p>}
              {!isStarredLoading && !error && starredRepos && renderRepoList(
                starredRepos,
                'Starred Repositories',
                'No starred repositories found.'
              )}
            </>
          )}
        </div>
      </div>

      {isOwnProfile && (
        <button onClick={handleLogout} id="logout">Logout</button>
      )}
      {/* Show error banner for non-critical errors like failed starred fetch */}
      {error && !isStarredLoading && activeTab === 'starred' && <div className="profile-error-banner">{`Error: ${error}`}</div>}
    </>
  );
};

export default Profile;