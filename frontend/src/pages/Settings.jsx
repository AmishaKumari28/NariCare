
import { useEffect, useState } from "react";

import {
  UserRound,
  LockKeyhole,
  ShieldCheck,
  LogOut,
  Save,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import { apiRequest } from "../services/api";
import "./Settings.css";

export default function Settings() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);

        const data = await apiRequest("/auth/me");

        setProfile({
          name: data.name || "",
          email: data.email || "",
        });
      } catch (err) {
        setError(
          err.message || "Unable to load your profile."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const updateProfile = async (event) => {
    event.preventDefault();

    setProfileMessage("");
    setError("");

    if (!profile.name.trim() || !profile.email.trim()) {
      setError("Name and email are required.");
      return;
    }

    try {
      setSavingProfile(true);

      const result = await apiRequest(
        "/auth/profile",
        {
          method: "PUT",
          body: JSON.stringify(profile),
        }
      );

      setProfile({
        name: result.user.name,
        email: result.user.email,
      });

      setProfileMessage(
        "Profile updated successfully!"
      );
    } catch (err) {
      setError(
        err.message || "Unable to update profile."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();

    setPasswordMessage("");
    setError("");

    if (passwords.newPassword.length < 6) {
      setError(
        "New password must be at least 6 characters."
      );
      return;
    }

    if (
      passwords.newPassword !==
      passwords.confirmPassword
    ) {
      setError("New passwords do not match.");
      return;
    }

    try {
      setSavingPassword(true);

      await apiRequest(
        "/auth/change-password",
        {
          method: "PUT",
          body: JSON.stringify({
            currentPassword: passwords.currentPassword,
            newPassword: passwords.newPassword,
          }),
        }
      );

      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setPasswordMessage(
        "Password changed successfully!"
      );
    } catch (err) {
      setError(
        err.message || "Unable to change password."
      );
    } finally {
      setSavingPassword(false);
    }
  };

  const logout = () => {
  sessionStorage.removeItem("sakhi_token");
  sessionStorage.removeItem("sakhi_user");

  window.location.replace("/login");
};

  return (
    <div className="sakhi-settings-page">
      <div className="sakhi-settings-header">
        <h1>Settings 💜</h1>
        <p>
          Manage your account and personal preferences.
        </p>
      </div>

      {error && (
        <div className="sakhi-settings-alert" role="alert">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="sakhi-settings-grid">
        {/* PROFILE */}
        <section className="sakhi-settings-card">
          <div className="sakhi-settings-card-title">
            <span className="sakhi-settings-icon pink">
              <UserRound size={21} />
            </span>

            <div>
              <h2>My Profile</h2>
              <p>Update your personal information</p>
            </div>
          </div>

          {loading ? (
            <p>Loading profile...</p>
          ) : (
            <form onSubmit={updateProfile}>
              <label htmlFor="settings-name">
                Full Name
              </label>

              <input
                id="settings-name"
                type="text"
                maxLength={100}
                value={profile.name}
                onChange={(event) =>
                  setProfile({
                    ...profile,
                    name: event.target.value,
                  })
                }
                required
              />

              <label htmlFor="settings-email">
                Email Address
              </label>

              <input
                id="settings-email"
                type="email"
                value={profile.email}
                onChange={(event) =>
                  setProfile({
                    ...profile,
                    email: event.target.value,
                  })
                }
                required
              />

              <button
                type="submit"
                className="sakhi-settings-btn"
                disabled={savingProfile}
              >
                <Save size={17} />
                {savingProfile
                  ? "Saving..."
                  : "Save Changes"}
              </button>

              {profileMessage && (
                <p className="sakhi-settings-success">
                  <CheckCircle2 size={16} />
                  {profileMessage}
                </p>
              )}
            </form>
          )}
        </section>

        {/* CHANGE PASSWORD */}
        <section className="sakhi-settings-card">
          <div className="sakhi-settings-card-title">
            <span className="sakhi-settings-icon lavender">
              <LockKeyhole size={21} />
            </span>

            <div>
              <h2>Change Password</h2>
              <p>Keep your account secure</p>
            </div>
          </div>

          <form onSubmit={changePassword}>
            <label htmlFor="current-password">
              Current Password
            </label>

            <input
              id="current-password"
              type={showPassword ? "text" : "password"}
              value={passwords.currentPassword}
              onChange={(event) =>
                setPasswords({
                  ...passwords,
                  currentPassword: event.target.value,
                })
              }
              required
            />

            <label htmlFor="new-password">
              New Password
            </label>

            <input
              id="new-password"
              type={showPassword ? "text" : "password"}
              value={passwords.newPassword}
              onChange={(event) =>
                setPasswords({
                  ...passwords,
                  newPassword: event.target.value,
                })
              }
              minLength={6}
              required
            />

            <label htmlFor="confirm-password">
              Confirm New Password
            </label>

            <input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              value={passwords.confirmPassword}
              onChange={(event) =>
                setPasswords({
                  ...passwords,
                  confirmPassword: event.target.value,
                })
              }
              required
            />

            <button
              type="button"
              className="sakhi-settings-show"
              onClick={() =>
                setShowPassword(!showPassword)
              }
            >
              {showPassword ? (
                <EyeOff size={16} />
              ) : (
                <Eye size={16} />
              )}

              {showPassword
                ? "Hide passwords"
                : "Show passwords"}
            </button>

            <button
              type="submit"
              className="sakhi-settings-btn"
              disabled={savingPassword}
            >
              <LockKeyhole size={17} />
              {savingPassword
                ? "Updating..."
                : "Update Password"}
            </button>

            {passwordMessage && (
              <p className="sakhi-settings-success">
                <CheckCircle2 size={16} />
                {passwordMessage}
              </p>
            )}
          </form>
        </section>

        {/* PRIVACY */}
        <section className="sakhi-settings-card">
          <div className="sakhi-settings-card-title">
            <span className="sakhi-settings-icon mint">
              <ShieldCheck size={21} />
            </span>

            <div>
              <h2>Privacy & Security</h2>
              <p>Your health information matters</p>
            </div>
          </div>

          <div className="sakhi-settings-privacy">
            <p>
              Your symptom records, menstrual cycle data,
              and doctor reports contain personal health
              information.
            </p>

            <p>
              Avoid sharing your login credentials or
              downloaded reports with anyone you do not
              trust.
            </p>

            <p>
              Sign out when using a shared computer.
              Downloaded PDF reports remain on your device
              until you delete them.
            </p>
          </div>
        </section>

        {/* LOGOUT */}
        <section className="sakhi-settings-card">
          <div className="sakhi-settings-card-title">
            <span className="sakhi-settings-icon blue">
              <LogOut size={21} />
            </span>

            <div>
              <h2>Account Session</h2>
              <p>Sign out of Sakhi Health</p>
            </div>
          </div>

          <p className="sakhi-settings-logout-text">
            Logging out removes your saved login session
            from this browser. Your health records remain
            stored in your account.
          </p>

          <button
            type="button"
            className="sakhi-settings-logout"
            onClick={logout}
          >
            <LogOut size={17} />
            Logout
          </button>
        </section>
      </div>
    </div>
  );
}
