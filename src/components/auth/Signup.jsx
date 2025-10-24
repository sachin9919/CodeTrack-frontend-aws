import React, { useState } from "react";
// IMPORT THE NEW CENTRAL API CONFIG
import api from "../../api/axiosConfig";
import { useAuth } from "../../authContext";
import { Box, Button, Heading } from "@primer/react";
import "./auth.css";
import logo from "../../assets/github-mark-white.svg";
import { Link, useNavigate } from "react-router-dom";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setCurrentUser } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      // CORRECTION: Use imported 'api' instance with relative path
      const res = await api.post("/user/signup", {
        email: email,
        password: password,
        username: username,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.userId);
      localStorage.setItem("avatarUrl", res.data.avatarUrl || '');

      setCurrentUser(res.data.userId);
      setLoading(false);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Signup Failed!");
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-logo-container">
        <img className="logo-login" src={logo} alt="Logo" />
      </div>
      <div className="login-box-wrapper">
        <div className="login-heading">
          <Box sx={{ padding: 1 }}>
            <Heading as="h1" sx={{ fontSize: 4 }}>Sign Up</Heading>
          </Box>
        </div>
        <div className="login-box">
          {error && <p className="error-message">{error}</p>}
          <div>
            <label className="label">Username</label>
            <input
              autoComplete="off"
              name="Username"
              id="Username"
              className="input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Email address</label>
            <input
              autoComplete="off"
              name="Email"
              id="Email"
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="div">
            <label className="label">Password</label>
            <input
              autoComplete="off"
              name="Password"
              id="Password"
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button
            variant="primary"
            className="login-btn"
            disabled={loading}
            onClick={handleSignup}
          >
            {loading ? "Loading..." : "Sign Up"}
          </Button>
        </div>
        <div className="pass-box">
          <p>
            Already have an account? <Link to="/auth">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;