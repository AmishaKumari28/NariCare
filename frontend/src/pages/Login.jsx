
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Keep existing storage keys for compatibility.
      sessionStorage.setItem("sakhi_token", data.token);
      sessionStorage.setItem(
        "sakhi_user",
        JSON.stringify(data.user)
      );

      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
          maxWidth: "420px",
          background: "white",
          padding: "35px",
          borderRadius: "18px",
          boxShadow: "0 8px 30px rgba(76,29,149,0.08)",
        }}
      >
        <h1
          style={{
            color: "#6d28d9",
            textAlign: "center",
          }}
        >
          NariCare 💜
        </h1>

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
          Welcome Back
        </h2>

        <p
          style={{
            textAlign: "center",
            color: "#6b7280",
          }}
        >
          Login to your health dashboard
        </p>

        <form onSubmit={handleLogin}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={{
              width: "100%",
              padding: "12px",
              margin: "8px 0 18px",
              border: "1px solid #ddd6fe",
              borderRadius: "8px",
              boxSizing: "border-box",
            }}
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            style={{
              width: "100%",
              padding: "12px",
              margin: "8px 0 18px",
              border: "1px solid #ddd6fe",
              borderRadius: "8px",
              boxSizing: "border-box",
            }}
          />

          {error && (
            <p role="alert" style={{ color: "#dc2626" }}>
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
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
          }}
        >
          Don't have an account?{" "}
          <Link
            to="/register"
            style={{ color: "#7c3aed" }}
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
