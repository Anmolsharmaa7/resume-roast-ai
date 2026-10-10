import { useEffect, useState } from "react";
import {
  BarChart3,
  Bell,
  ChevronDown,
  FileText,
  LayoutDashboard,
  LogOut,
  Moon,
  Plus,
  Settings,
  Sun,
  Upload,
  User,
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

export default function Layout() {
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("resumeRoastTheme") === "dark"
  );

  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("resumeRoastUser")) || {};
    } catch {
      return {};
    }
  });

  // Apply theme to the ENTIRE application
  useEffect(() => {
    const theme = darkMode ? "dark" : "light";

    localStorage.setItem("resumeRoastTheme", theme);

    document.documentElement.classList.toggle("dark-mode", darkMode);
    document.body.classList.toggle("dark-mode", darkMode);

    document.documentElement.style.colorScheme = theme;
  }, [darkMode]);

  // Keep profile updated if user data changes
  useEffect(() => {
    const updateUser = () => {
      try {
        const savedUser =
          JSON.parse(localStorage.getItem("resumeRoastUser")) || {};
        setUser(savedUser);
      } catch {
        setUser({});
      }
    };

    window.addEventListener("storage", updateUser);

    return () => {
      window.removeEventListener("storage", updateUser);
    };
  }, []);

  const fullName = user?.name || "User";
  const firstName = fullName.split(" ")[0] || "User";

  const initials =
    fullName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join("") || "U";

  const handleLogout = () => {
    localStorage.removeItem("resumeRoastAuth");
    localStorage.removeItem("resumeRoastToken");
    localStorage.removeItem("resumeRoastUser");

    setProfileOpen(false);
    navigate("/login");
  };

  const navItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Upload Resume",
      path: "/upload",
      icon: Upload,
    },
    {
      label: "Resume Analysis",
      path: "/analysis",
      icon: BarChart3,
    },
    {
      label: "Resume Builder",
      path: "/builder",
      icon: FileText,
    },
    {
      label: "Improved Resume",
      path: "/improved",
      icon: Plus,
    },
  ];

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="brand">
            <div className="brand-mark">R</div>

            <div className="brand-text">
              <strong>ResumeRoast</strong>
              <span>AI</span>
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
                    `nav-item ${isActive ? "active" : ""}`
                  }
                >
                  <Icon size={18} strokeWidth={2} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <div className="tip-icon">✦</div>

            <div>
              <strong>Improve your resume</strong>
              <span>Get sharper feedback and better results.</span>
            </div>
          </div>

          <button
            className="sidebar-profile"
            onClick={() => setProfileOpen((prev) => !prev)}
          >
            <div className="profile-avatar">{initials}</div>

            <div className="sidebar-profile-info">
              <strong>{firstName}</strong>
              <span>ResumeRoast user</span>
            </div>

            <ChevronDown
              size={16}
              className={profileOpen ? "rotate-icon" : ""}
            />
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <span className="workspace-label">Resume workspace</span>
          </div>

          <div className="topbar-right">
            {/* Theme button */}
            <button
              className="icon-button theme-button"
              onClick={() => setDarkMode((prev) => !prev)}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              title={darkMode ? "Light mode" : "Dark mode"}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notification */}
            <button
              className="icon-button notification-button"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell size={18} />
              <span className="notification-dot"></span>
            </button>

            {/* Profile */}
            <div className="profile-wrapper">
              <button
                className="topbar-profile"
                onClick={() => setProfileOpen((prev) => !prev)}
              >
                <div className="profile-avatar">{initials}</div>

                <div className="topbar-profile-info">
                  <strong>{firstName}</strong>
                  <span>My account</span>
                </div>

                <ChevronDown
                  size={16}
                  className={profileOpen ? "rotate-icon" : ""}
                />
              </button>

              {profileOpen && (
                <div className="profile-dropdown">
                  <div className="profile-dropdown-header">
                    <div className="profile-avatar large">{initials}</div>

                    <div>
                      <strong>{fullName}</strong>
                      <span>{user?.email || "ResumeRoast AI user"}</span>
                    </div>
                  </div>

                  <div className="dropdown-divider"></div>

                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/dashboard");
                    }}
                  >
                    <User size={16} />
                    Profile
                  </button>

                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/dashboard");
                    }}
                  >
                    <Settings size={16} />
                    Settings
                  </button>

                  <div className="dropdown-divider"></div>

                  <button
                    className="dropdown-item logout-item"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}