import React, { useState, useEffect } from 'react';
// REMOVED: import axios from 'axios';
// IMPORT THE NEW CENTRAL API CONFIG
import api from '../../api/axiosConfig';
import './settings.css';

const Settings = () => {
    const [formData, setFormData] = useState({ email: '', newPassword: '', confirmPassword: '' });
    const [avatarFile, setAvatarFile] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (userId) {
            const fetchUserData = async () => {
                try {
                    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
                    // CORRECTION: Use imported 'api' instance with relative path
                    const response = await api.get(`/user/userProfile/${userId}`, config);
                    if (response.data) {
                        setCurrentUser(response.data);
                        setFormData(prev => ({ ...prev, email: response.data.email || '' }));
                        localStorage.setItem('avatarUrl', response.data.avatarUrl || '');
                    } else { setError('Received invalid user data.'); }
                } catch (err) { setError('Failed to fetch user data.'); console.error("Fetch user data error:", err); }
            };
            fetchUserData();
        } else { setError("User not logged in."); }
    }, [userId, token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setAvatarFile(e.target.files[0]);
            console.log("File selected:", e.target.files[0].name);
        } else { setAvatarFile(null); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        if (!userId || !token) { setError("Not authenticated."); return; }

        // --- Handle Email/Password Update ---
        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            setError("Passwords do not match."); return;
        }

        setLoading(true);
        try {
            const payload = { email: formData.email };
            if (formData.newPassword) { payload.password = formData.newPassword; }
            const config = { headers: { Authorization: `Bearer ${token}` } };
            // CORRECTION: Use imported 'api' instance with relative path
            const response = await api.put(`/user/updateProfile/${userId}`, payload, config);
            if (response.data) {
                setMessage('Profile details updated successfully!');
                setCurrentUser(prev => ({ ...prev, email: response.data.email }));
                setFormData(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
            }
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || 'Error updating profile details.');
            console.error("Update profile error:", err);
        } finally {
            setLoading(false);
        }

        // --- Handle Avatar Upload ---
        if (avatarFile) {
            setUploading(true);
            const avatarFormData = new FormData();
            avatarFormData.append('avatar', avatarFile);
            try {
                const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } };
                // CORRECTION: Use imported 'api' instance with relative path
                const response = await api.put(`/user/updateAvatar`, avatarFormData, config);

                if (response.data?.user?.avatarUrl) {
                    const newAvatarUrl = response.data.user.avatarUrl;
                    setMessage(prev => prev ? prev + ' Avatar updated!' : 'Avatar updated successfully!');
                    setCurrentUser(prev => ({ ...prev, avatarUrl: newAvatarUrl }));
                    localStorage.setItem('avatarUrl', newAvatarUrl);
                    window.dispatchEvent(new Event('avatarUpdated'));
                    setAvatarFile(null);
                    if (document.getElementById('avatar')) document.getElementById('avatar').value = '';
                }
            } catch (err) {
                const uploadError = err.response?.data?.error || 'Error uploading avatar.';
                setError(prevError => prevError ? prevError + ` ${uploadError}` : uploadError);
                console.error("Avatar upload error:", err);
            } finally {
                setUploading(false);
            }
        }
    };

    if (!currentUser && !error && userId) {
        return <div style={{ color: 'white', padding: '50px', textAlign: 'center' }}>Loading settings...</div>;
    }

    return (
        <div className="settings-container">
            <div className="settings-form-wrapper">
                <form onSubmit={handleSubmit}>
                    <h2>Account Settings</h2>

                    {/* Display current avatar */}
                    {currentUser?.avatarUrl ? (
                        <div className="avatar-preview">
                            <img src={currentUser.avatarUrl} alt="Current Avatar" />
                        </div>
                    ) : (
                        <div className="avatar-preview">
                            <div className="profile-image-placeholder" style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#555', margin: '0 auto' }}></div>
                        </div>
                    )}
                    {currentUser?.username && <p className="username-display">Username: {currentUser.username}</p>}

                    {message && <p className="success-message">{message}</p>}
                    {error && <p className="error-message">{error}</p>}

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required disabled={!currentUser} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="newPassword">New Password (optional)</label>
                        <input type="password" id="newPassword" name="newPassword" value={formData.newPassword} onChange={handleChange} placeholder="Leave blank to keep current" disabled={!currentUser} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm New Password</label>
                        <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} disabled={!formData.newPassword || !currentUser} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="avatar">Change Profile Picture</label>
                        <input type="file" id="avatar" name="avatar" accept="image/*" onChange={handleFileChange} disabled={!currentUser} />
                        {avatarFile && <span className="file-name-display">{avatarFile.name}</span>}
                    </div>

                    <button type="submit" disabled={loading || uploading || !currentUser}>
                        {loading ? 'Saving Details...' : (uploading ? 'Uploading Avatar...' : 'Save Changes')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Settings;