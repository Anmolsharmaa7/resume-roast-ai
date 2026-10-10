import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Wallet,
  Settings,
  Bell,
  Sun,
  Moon,
  LogOut,
  User,
  ChevronDown,
  TrendingUp,
  X,
} from "lucide-react";

export default function Layout() {
  const navigate = useNavigate();
  const profileRef = useRef(null);

  // -----------------------------
  // User
  // -----------------------------
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("resumeRoastUser");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  // -----------------------------
  // Theme
  // -----------------------------
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("resumeRoastTheme") === "dark";
  });

  // -----------------------------
  // Profile dropdown
  // -----------------------------
  const [profileOpen, setProfileOpen] = useState(false);

  // -----------------------------
  // Notifications
  // -----------------------------
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [notifications] = useState([
    {
      id: 1,
      title: "Resume analysis ready",
      text: "Your latest resume analysis is ready to review.",
      time: "2 min ago",
      unread: true,
    },
    {
      id: 2,
      title: "Resume score improved",
      text: "Your ATS score increased after your latest changes.",
      time: "1 hour ago",
      unread: true,
    },
    {
      id: 3,
      title: "Welcome to ResumeRoast AI",
      text: "Start by uploading your resume.",
      time: "Today",
      unread: false,
    },
  ]);

  // -----------------------------
  // Theme effect
  // -----------------------------
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);

    localStorage.setItem(
      "resumeRoastTheme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  // -----------------------------
  // Close profile when clicking outside
  // -----------------------------
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // -----------------------------
  // Sync user from localStorage
  // -----------------------------
  useEffect(() => {
    function syncUser() {
      try {
        const storedUser = localStorage.getItem("resumeRoastUser");
        setUser(storedUser ? JSON.parse(storedUser) : null);
      } catch {
        setUser(null);
      }
    }

    window.addEventListener("storage", syncUser);

    return () => {
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  // -----------------------------
  // User display helpers
  // -----------------------------
  const fullName = user?.name?.trim() || "User";

  const firstName = fullName.split(/\s+/)[0] || "User";

  const initials =
    fullName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((name) => name.charAt(0).toUpperCase())
      .join("") || "U";

  const email = user?.email || "ResumeRoast AI user";

  // -----------------------------
  // Logout
  // -----------------------------
  function handleLogout() {
    localStorage.removeItem("resumeRoastAuth");
    localStorage.removeItem("resumeRoastToken");
    localStorage.removeItem("resumeRoastUser");

    setUser(null);
    setProfileOpen(false);
    setNotificationsOpen(false);

    navigate("/login", { replace: true });
  }

  // -----------------------------
  // Navigation
  // -----------------------------
  const navItems = [
    {
      label: "Dashboard",
      path: "/",
      icon: LayoutDashboard,
    },
    {
      label: "Upload Resume",
      path: "/upload",
      icon: FileText,
    },
    {
      label: "Resume Analysis",
      path: "/analyze",
      icon: BarChart3,
    },
    {
      label: "Improved Resume",
      path: "/improved-resume",
      icon: TrendingUp,
    },
    {
      label: "Resume Builder",
      path: "/resume-builder",
      icon: Wallet,
    },
  ];

  return (
    <div className={`app-layout ${darkMode ? "dark-mode" : ""}`}>
      {/* =========================================
          SIDEBAR
      ========================================= */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark">
            <TrendingUp size={20} />
          </div>

          <div className="logo-text">
            <strong>
              ResumeRoast <span>AI</span>
            </strong>
            <small>Resume Intelligence</small>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">WORKSPACE</div>

          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          <div className="nav-section-title settings-title">
            ACCOUNT
          </div>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <Settings size={18} />
            <span>Settings</span>
          </NavLink>
        </nav>

        {/* Sidebar bottom */}
        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <div className="help-icon">
              <FileText size={18} />
            </div>

            <div>
              <strong>Resume tip</strong>
              <p>
                Keep your bullet points specific and measurable.
              </p>
            </div>
          </div>

          <div className="sidebar-profile">
            <div className="profile-avatar">
              {initials}
            </div>

            <div className="sidebar-profile-info">
              <strong>{firstName}</strong>
              <span>{email}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* =========================================
          MAIN AREA
      ========================================= */}
      <div className="main-area">
        {/* =========================================
            TOPBAR
        ========================================= */}
        <header className="topbar">
          <div className="topbar-left">
            <div className="page-context">
              <span>Workspace</span>
            </div>
          </div>

          <div className="topbar-right">
            {/* Theme toggle */}
            <button
              className="icon-button"
              type="button"
              onClick={() => setDarkMode((prev) => !prev)}
              title={
                darkMode
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              {darkMode ? (
                <Sun size={19} />
              ) : (
                <Moon size={19} />
              )}
            </button>

            {/* Notifications */}
            <div className="notification-wrapper">
              <button
                className="icon-button notification-button"
                type="button"
                onClick={() => {
                  setNotificationsOpen((prev) => !prev);
                  setProfileOpen(false);
                }}
                title="Notifications"
              >
                <Bell size={19} />

                {notifications.some(
                  (notification) => notification.unread
                ) && <span className="notification-dot" />}
              </button>

              {notificationsOpen && (
                <div className="notification-dropdown">
                  <div className="dropdown-header">
                    <div>
                      <strong>Notifications</strong>
                      <span>Recent activity</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setNotificationsOpen(false)}
                    >
                      <X size={17} />
                    </button>
                  </div>

                  <div className="notification-list">
                    {notifications.map((notification) => (
                      <div
                        className={`notification-item ${
                          notification.unread ? "unread" : ""
                        }`}
                        key={notification.id}
                      >
                        <div className="notification-item-icon">
                          <Bell size={15} />
                        </div>

                        <div className="notification-content">
                          <strong>{notification.title}</strong>
                          <p>{notification.text}</p>
                          <span>{notification.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="notification-footer">
                    <button type="button">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="profile-wrapper" ref={profileRef}>
              <button
                className="profile-button"
                type="button"
                onClick={() => {
                  setProfileOpen((prev) => !prev);
                  setNotificationsOpen(false);
                }}
              >
                <div className="profile-avatar">
                  {initials}
                </div>

                <span className="profile-name">
                  {firstName}
                </span>

                <ChevronDown
                  size={16}
                  className={`profile-chevron ${
                    profileOpen ? "open" : ""
                  }`}
                />
              </button>

              {profileOpen && (
                <div className="profile-dropdown">
                  <div className="profile-dropdown-header">
                    <div className="profile-avatar large">
                      {initials}
                    </div>

                    <div>
                      <strong>{fullName}</strong>
                      <span>{email}</span>
                    </div>
                  </div>

                  <div className="profile-dropdown-divider" />

                  <button
                    type="button"
                    className="profile-dropdown-item"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/settings");
                    }}
                  >
                    <User size={17} />
                    <span>Profile & Settings</span>
                  </button>

                  <button
                    type="button"
                    className="profile-dropdown-item"
                    onClick={() => {
                      setDarkMode((prev) => !prev);
                    }}
                  >
                    {darkMode ? (
                      <Sun size={17} />
                    ) : (
                      <Moon size={17} />
                    )}

                    <span>
                      {darkMode
                        ? "Light mode"
                        : "Dark mode"}
                    </span>
                  </button>

                  <div className="profile-dropdown-divider" />

                  <button
                    type="button"
                    className="profile-dropdown-item logout-item"
                    onClick={handleLogout}
                  >
                    <LogOut size={17} />
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* =========================================
            PAGE CONTENT
        ========================================= */}
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}