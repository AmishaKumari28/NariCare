
import { Bell, ChevronDown, Search } from "lucide-react";

function TopNavbar() {
  let user = {};

  try {
    user = JSON.parse(
      sessionStorage.getItem("sakhi_user") || "{}"
    );
  } catch {
    user = {};
  }

  const userName = user.name || "User";

  const firstLetter = userName.charAt(0).toUpperCase();

  return (
    <header className="top-navbar">
      <div className="navbar-search">
        <Search size={16} />

        <input
          type="text"
          placeholder="Search anything..."
          aria-label="Search"
          readOnly
        />
      </div>

      <div className="navbar-right">
        <span
          className="navbar-notification"
          aria-label="Notifications"
          title="Notifications coming soon"
        >
          <Bell size={19} />
        </span>

        <div className="navbar-profile">
          <div className="navbar-avatar">
            {firstLetter}
          </div>

          <span>{userName}</span>

          <ChevronDown size={14} />
        </div>
      </div>
    </header>
  );
}

export default TopNavbar;
