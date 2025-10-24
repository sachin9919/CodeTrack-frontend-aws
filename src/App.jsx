import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import ProjectRoutes from "./Routes";
import "./App.css";

function App() {
  return (
    <Router>
      <ProjectRoutes />
    </Router>
  );
}

export default App;
