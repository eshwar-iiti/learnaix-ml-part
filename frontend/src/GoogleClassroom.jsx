import { useState, useEffect } from "react";

function GoogleClassroom() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [authState, setAuthState] = useState(null);

  // Check if user is already logged in (state stored in localStorage)
  useEffect(() => {
    const savedState = localStorage.getItem("google_auth_state");
    if (savedState) {
      setAuthState(savedState);
      setIsLoggedIn(true);
      fetchCourses(savedState);
    }
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://127.0.0.1:8000/google/login");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to initiate login");
      }

      // Store state for later use
      localStorage.setItem("google_auth_state", data.state);
      
      // Redirect to Google OAuth
      window.location.href = data.authorization_url;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchCourses = async (state) => {
    setLoading(true);
    setError("");

    try {
      console.log("Fetching courses with state:", state);
      
      const res = await fetch(`http://127.0.0.1:8000/google/courses?state=${state}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to fetch courses");
      }

      console.log("Courses fetched:", data.courses);
      setCourses(data.courses);
      setIsLoggedIn(true);
    } catch (err) {
      console.error("Fetch courses error:", err);
      setError(err.message);
      // If auth fails, clear stored state
      localStorage.removeItem("google_auth_state");
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("google_auth_state");
    setIsLoggedIn(false);
    setCourses([]);
    setAuthState(null);
  };

  return (
    <div style={{ marginTop: "40px" }}>
      <h2 style={{ color: "#ffffff" }}>Google Classroom</h2>

      {!isLoggedIn ? (
        <>
          <button 
            onClick={handleGoogleLogin} 
            disabled={loading}
            style={{
              backgroundColor: "#5865F2",
              color: "white",
              border: "none",
              padding: "12px 24px",
              fontSize: "16px",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              transition: "background-color 0.2s"
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = "#4752C4";
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = "#5865F2";
            }}
          >
            {loading ? "Loading..." : "🔐 Login with Google"}
          </button>
          {error && <p style={{ color: "#ff6b6b", marginTop: "10px" }}>{error}</p>}
        </>
      ) : (
        <>
          <button 
            onClick={handleLogout} 
            style={{ 
              marginBottom: "20px",
              backgroundColor: "#2C2F33",
              color: "white",
              border: "1px solid #40444B",
              padding: "10px 20px",
              fontSize: "14px",
              borderRadius: "4px",
              cursor: "pointer",
              transition: "background-color 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#23272A";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#2C2F33";
            }}
          >
            Logout
          </button>

          {loading && <p style={{ color: "#b9bbbe" }}>⏳ Loading courses...</p>}
          {error && <p style={{ color: "#ff6b6b" }}>{error}</p>}

          {courses.length > 0 ? (
            <div>
              <h3 style={{ color: "#ffffff" }}>Your Courses ({courses.length})</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {courses.map((course) => (
                  <div
                    key={course.id}
                    style={{
                      border: "1px solid #40444B",
                      padding: "16px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      backgroundColor: "#2C2F33",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                      transition: "transform 0.2s, box-shadow 0.2s, background-color 0.2s"
                    }}
                    onClick={() => window.location.href = `/course/${course.id}`}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.4)";
                      e.currentTarget.style.backgroundColor = "#36393F";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";
                      e.currentTarget.style.backgroundColor = "#2C2F33";
                    }}
                  >
                    <h4 style={{ margin: "0 0 8px 0", color: "#5865F2", fontSize: "18px" }}>
                      {course.name}
                    </h4>
                    <p style={{ margin: 0, color: "#b9bbbe", fontSize: "14px" }}>
                      {course.section ? `📚 ${course.section}` : "📚 No section"} 
                      {course.descriptionHeading && ` • ${course.descriptionHeading}`}
                    </p>
                    {course.courseState && (
                      <p style={{ margin: "8px 0 0 0", fontSize: "12px", color: "#72767d" }}>
                        Status: {course.courseState}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            !loading && <p style={{ color: "#b9bbbe" }}>No courses found</p>
          )}
        </>
      )}
    </div>
  );
}

export default GoogleClassroom;