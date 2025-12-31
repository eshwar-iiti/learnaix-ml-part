import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Flashcards from "./Flashcards";
import GoogleClassroom from "./GoogleClassroom";
import AuthCallback from "./AuthCallback";
import CourseDetail from "./CourseDetail";
import 'katex/dist/katex.min.css';

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

function HomePage() {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const uploadPdf = async () => {
    if (!file) {
      setError("Please select a PDF file");
      return;
    }

    setError("");
    setLoading(true);
    setSummary("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:8000/summarize", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to summarize");
      }

      setSummary(data.summary);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "auto" }}>
      <h1>PDF Summarizer</h1>

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br /><br />

      <button onClick={uploadPdf}>Summarize</button>

      <br /><br />

      {loading && <p>⏳ Summarizing...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {summary && (
        <>
          <h2>Summary</h2>
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
          >
            {summary}
          </ReactMarkdown>
        </>
      )}

      {/* 🔹 FLASHCARDS SECTION */}
      <hr style={{ margin: "40px 0" }} />

      <h2>Flashcards</h2>
      <Flashcards file={file} />

      {/* 🔹 GOOGLE CLASSROOM SECTION */}
      <hr style={{ margin: "40px 0" }} />
      
      <GoogleClassroom />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/course/:courseId" element={<CourseDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;