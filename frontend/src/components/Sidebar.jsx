
import { useEffect, useState } from "react";
import {
  NavLink,
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  HeartPulse,
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  ChartNoAxesCombined,
  FileHeart,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const menuItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Symptom Tracker",
    path: "/symptoms",
    icon: ClipboardList,
  },
  {
    name: "Cycle Tracker",
    path: "/cycle",
    icon: CalendarDays,
  },
  {
    name: "Insights & Patterns",
    path: "/insights",
    icon: ChartNoAxesCombined,
  },
  {
    name: "Doctor Report",
    path: "/report",
    icon: FileHeart,
  },
  {
    name: "Health Awareness",
    path: "/awareness",
    icon: BookOpen,
  },
];

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu when navigating.
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Allow Escape key to close the menu.
  useEffect(() => {
    if (!mobileOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen]);

  const closeMenu = () => {
    setMobileOpen(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("sakhi_token");
    sessionStorage.removeItem("sakhi_user");

    closeMenu();
    window.location.replace("/login");
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        className="mobile-menu-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={
          mobileOpen ? "Close menu" : "Open menu"
        }
        aria-expanded={mobileOpen}
        aria-controls="sakhi-sidebar"
      >
        {mobileOpen ? (
          <X size={23} />
        ) : (
          <Menu size={23} />
        )}
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          onClick={closeMenu}
          aria-label="Close navigation menu"
        />
      )}

      <aside
        id="sakhi-sidebar"
        className={`sidebar ${
          mobileOpen ? "sidebar-open" : ""
        }`}
      >
        {/* Logo */}
        <div className="sidebar-logo">
  <HeartPulse size={28} />
  <span>NariCare</span>
</div>

        {/* Navigation */}
        <nav
          className="sidebar-nav"
          aria-label="Main navigation"
        >
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `sidebar-link ${
                    isActive ? "active" : ""
                  }`
                }
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="sidebar-bottom">
          <NavLink
            to="/settings"
            onClick={closeMenu}
            className={({ isActive }) =>
              `sidebar-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <Settings size={19} />
            <span>Settings</span>
          </NavLink>

          <button
            type="button"
            onClick={handleLogout}
            className="sidebar-link sidebar-logout-btn"
          >
            <LogOut size={19} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
