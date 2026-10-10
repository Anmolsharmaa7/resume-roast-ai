import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import UploadResume from "./pages/UploadResume";
import ResumeAnalysis from "./pages/ResumeAnalysis";
import ResumeBuilder from "./pages/ResumeBuilder";
import ImprovedResume from "./pages/ImprovedResume";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            AUTH
        ========================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />


        {/* =========================
            PROTECTED APPLICATION
        ========================= */}

        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >

          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          {/* Upload Resume */}
          <Route
            path="/upload"
            element={<UploadResume />}
          />

          {/* Resume Analysis */}
          <Route
            path="/analysis"
            element={<ResumeAnalysis />}
          />

          {/* Resume Builder */}
          <Route
            path="/builder"
            element={<ResumeBuilder />}
          />

          {/* Improved Resume */}
          <Route
            path="/improved"
            element={<ImprovedResume />}
          />

        </Route>


        {/* =========================
            DEFAULT
        ========================= */}

        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />


        {/* =========================
            FALLBACK
        ========================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;