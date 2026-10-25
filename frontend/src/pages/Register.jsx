
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px",
    margin: "8px 0 16px",
    border: "1px solid #ddd6fe",
    borderRadius: "8px",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f3ff",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "#ffffff",
          padding: "35px",
          borderRadius: "18px",
          boxShadow: "0 8px 30px rgba(76,29,149,0.08)",
        }}
      >
        {/* NariCare Branding */}
        <h1
          style={{
            textAlign: "center",
            color: "#6d28d9",
          }}
        >
          NariCare 💜
        </h1>

        {/* Tagline */}
        <p
          style={{
            textAlign: "center",
            color: "#8b5fbf",
            fontSize: "14px",
            marginTop: "5px",
          }}
        >
          Your Health. Your Care. Your Companion.
        </p>

        <h2
          style={{
            textAlign: "center",
            marginTop: "20px",
          }}
        >
          Create Your Account
        </h2>

        <p
          style={{
            textAlign: "center",
            color: "#6b7280",
            marginBottom: "24px",
          }}
        >
          Start your personal health tracking journey.
        </p>

        <form onSubmit={handleRegister}>
          <label>Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            autoComplete="name"
            required
            maxLength={100}
            style={inputStyle}
          />

          <label>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            autoComplete="email"
            required
            style={inputStyle}
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 6 characters"
            autoComplete="new-password"
            required
            minLength={6}
            style={inputStyle}
          />

          <label>Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter password"
            autoComplete="new-password"
            required
            style={inputStyle}
          />

          {error && (
            <p
              role="alert"
              style={{
                color: "#dc2626",
                marginBottom: "15px",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              background: "#7c3aed",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              cursor: loading ? "wait" : "pointer",
              fontSize: "15px",
              fontWeight: "600",
            }}
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
          }}
        >
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#7c3aed" }}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
