
import { Navigate, Outlet, useLocation } from "react-router-dom";

function ProtectedRoute() {
  const location = useLocation();

  const token = sessionStorage.getItem("sakhi_token");

  // Redirect users who are not logged in
  if (!token) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // Allow logged-in users to access protected pages
  return <Outlet />;
}

export default ProtectedRoute;
