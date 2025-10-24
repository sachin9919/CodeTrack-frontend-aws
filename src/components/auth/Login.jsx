import React, { useState } from "react";
// IMPORT THE NEW CENTRAL API CONFIG
import api from "../../api/axiosConfig";
import { useAuth } from "../../authContext";
import { Box, Button, Heading } from "@primer/react";
import "./auth.css";
import logo from "../../assets/github-mark-white.svg";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // Add error state
  const { setCurrentUser } = useAuth();
  const navigate = useNavigate(); // Use navigate hook

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    try {
      setLoading(true);
      // CORRECTION: Use imported 'api' instance with relative path
      const res = await api.post("/user/login", {
        email: email,
        password: password,
      });

      // Set items from response
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.userId);
      localStorage.setItem("avatarUrl", res.data.avatarUrl || ''); // Save avatarUrl

      setCurrentUser(res.data.userId); // Update context
      setLoading(false);

      navigate("/"); // Use navigate to redirect
    } catch (err) {
      console.error(err);
      // Set specific error message
      setError(err.response?.data?.message || "Login Failed!");
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
            <Heading as="h1" sx={{ fontSize: 4 }}>Sign In</Heading>
          </Box>
        </div>
        <div className="login-box">
          {/* Display error message */}
          {error && <p className="error-message">{error}</p>}
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
            onClick={handleLogin}
          >
            {loading ? "Loading..." : "Login"}
          </Button>
        </div>
        <div className="pass-box">
          <p>
            New to GitHub? <Link to="/signup">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;