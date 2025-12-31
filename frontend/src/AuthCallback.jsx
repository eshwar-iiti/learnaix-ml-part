import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState("");
  const hasRun = useRef(false); // Prevent double execution

  useEffect(() => {
    // Prevent double execution in React StrictMode
    if (hasRun.current) return;
    hasRun.current = true;

    const handleCallback = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");

      if (!code || !state) {
        console.error("Missing code or state");
        setError("Missing authorization code or state");
        setTimeout(() => navigate("/"), 2000);
        return;
      }

      try {
        console.log("Calling backend callback...");
        
        // Call the backend callback endpoint
        const res = await fetch(
          `http://127.0.0.1:8000/google/callback?code=${code}&state=${state}`
        );
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.detail || "Authentication failed");
        }

        console.log("Auth successful, state:", data.state);

        // Store the state in localStorage
        localStorage.setItem("google_auth_state", data.state);

        // Redirect immediately
        navigate("/");

      } catch (err) {
        console.error("Auth error:", err);
        setError(err.message);
        setTimeout(() => navigate("/"), 2000);
      }
    };

    handleCallback();
  }, []); // Empty dependency array

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h2>Authenticating...</h2>
      <p>Please wait while we log you in.</p>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default AuthCallback;
