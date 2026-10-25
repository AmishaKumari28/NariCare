
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import SymptomTracker from "./pages/SymptomTracker";
import CycleTracker from "./pages/CycleTracker";
import Insights from "./pages/Insights";
import DoctorReport from "./pages/DoctorReport";
import HealthAwareness from "./pages/HealthAwareness";
import Settings from "./pages/Settings";

import Login from "./pages/Login";
import Register from "./pages/Register";
import TopNavbar from "./components/TopNavbar";

import "./App.css";

function AppLayout() {
  const location = useLocation();

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register";

  const token = sessionStorage.getItem("sakhi_token");

  // Show sidebar only for logged-in users
  // who are not on login/register pages
  const showSidebar = Boolean(token) && !isAuthPage;

  return (
    <>
      {showSidebar && <Sidebar />}

      <main className={showSidebar ? "main-content" : ""}>
        {showSidebar && <TopNavbar />}

        <div className={showSidebar ? "page-content" : ""}>
          <Routes>
            {/* Default route */}
            <Route
              path="/"
              element={
                <Navigate
                  to={token ? "/dashboard" : "/login"}
                  replace
                />
              }
            />

            {/* Public authentication routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected application routes */}
            <Route element={<ProtectedRoute />}>
              <Route
                path="/dashboard"
                element={<Dashboard />}
              />

              <Route
                path="/symptoms"
                element={<SymptomTracker />}
              />

              <Route
                path="/cycle"
                element={<CycleTracker />}
              />

              <Route
                path="/insights"
                element={<Insights />}
              />

              <Route
                path="/report"
                element={<DoctorReport />}
              />

              <Route
                path="/awareness"
                element={<HealthAwareness />}
              />

              {/* Settings page */}
              <Route
                path="/settings"
                element={<Settings />}
              />
            </Route>

            {/* Unknown routes */}
            <Route
              path="*"
              element={
                <Navigate
                  to={token ? "/dashboard" : "/login"}
                  replace
                />
              }
            />
          </Routes>
        </div>
      </main>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
