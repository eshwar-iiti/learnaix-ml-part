import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [course, setCourse] = useState(null);

  useEffect(() => {
    // For now, just show the courseId
    // We'll implement the actual fetching in Phase 2
    setCourse({ id: courseId, name: "Loading course details..." });
  }, [courseId]);

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "auto" }}>
      <button onClick={() => navigate("/")}>← Back to Courses</button>
      
      <h1>Course Details</h1>
      <h2>Course ID: {courseId}</h2>

      <p style={{ color: "#666", marginTop: "20px" }}>
        📌 Phase 2 will add: Announcements, Assignments, and Attachments here
      </p>
    </div>
  );
}

export default CourseDetail;