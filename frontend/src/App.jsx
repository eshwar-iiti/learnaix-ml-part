// import { useState } from "react";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Flashcards from "./Flashcards";
// import GoogleClassroom from "./GoogleClassroom";
// import AuthCallback from "./AuthCallback";
// import CourseDetail from "./CourseDetail";
// import 'katex/dist/katex.min.css';

// import ReactMarkdown from "react-markdown";
// import remarkMath from "remark-math";
// import rehypeKatex from "rehype-katex";

// function HomePage() {
//   const [file, setFile] = useState(null);
//   const [summary, setSummary] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const uploadPdf = async () => {
//     if (!file) {
//       setError("Please select a PDF file");
//       return;
//     }

//     setError("");
//     setLoading(true);
//     setSummary("");

//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//       const res = await fetch("http://127.0.0.1:8000/summarize", {
//         method: "POST",
//         body: formData,
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.detail || "Failed to summarize");
//       }

//       setSummary(data.summary);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{ padding: "40px", maxWidth: "800px", margin: "auto" }}>
//       <h1>PDF Summarizer</h1>

//       <input
//         type="file"
//         accept="application/pdf"
//         onChange={(e) => setFile(e.target.files[0])}
//       />

//       <br /><br />

//       <button onClick={uploadPdf}>Summarize</button>

//       <br /><br />

//       {loading && <p>⏳ Summarizing...</p>}
//       {error && <p style={{ color: "red" }}>{error}</p>}

//       {summary && (
//         <>
//           <h2>Summary</h2>
//           <ReactMarkdown
//             remarkPlugins={[remarkMath]}
//             rehypePlugins={[rehypeKatex]}
//           >
//             {summary}
//           </ReactMarkdown>
//         </>
//       )}

//       {/* 🔹 FLASHCARDS SECTION */}
//       <hr style={{ margin: "40px 0" }} />

//       <h2>Flashcards</h2>
//       <Flashcards file={file} />

//       {/* 🔹 GOOGLE CLASSROOM SECTION */}
//       <hr style={{ margin: "40px 0" }} />
      
//       <GoogleClassroom />
//     </div>
//   );
// }

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<HomePage />} />
//         <Route path="/auth/callback" element={<AuthCallback />} />
//         <Route path="/course/:courseId" element={<CourseDetail />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;

import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import 'katex/dist/katex.min.css';

// Import your components
import Flashcards from "./Flashcards";
import GoogleClassroom from "./GoogleClassroom";
import AuthCallback from "./AuthCallback";
import CourseDetail from "./CourseDetail";
import Quiz from "./quiz"; // Import the new Quiz component

function HomePage() {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState("");
  const [quizData, setQuizData] = useState(null); // New state for Quiz
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const uploadPdf = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }
    setError("");
    setLoading(true);
    setSummary("");
    setQuizData(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:8000/summarize", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to summarize");
      setSummary(data.summary);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateQuiz = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }
    setError("");
    setLoading(true);
    setQuizData(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:8000/quiz", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to generate quiz");
      setQuizData(data.quiz);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // If quiz data exists, show the Quiz interface instead of the home dashboard
  if (quizData) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setQuizData(null)}
            className="mb-6 text-blue-600 font-semibold hover:underline flex items-center"
          >
            ← Back to Dashboard
          </button>
          <Quiz quizData={quizData} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Study<span className="text-blue-600">AI</span>
          </h1>
          <p className="mt-3 text-xl text-gray-500">
            Upload PDFs/PPTXs, generate study aids, and sync with Google Classroom.
          </p>
        </div>

        {/* Upload Card */}
        <div className="bg-white shadow-xl rounded-2xl p-8 mb-8 border border-gray-100">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 hover:border-blue-400 transition-colors">
            <input
              type="file"
              accept=".pdf,.pptx"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              onChange={(e) => setFile(e.target.files[0])}
            />
            {file && <p className="mt-2 text-sm text-green-600 font-medium">Selected: {file.name}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <button
              onClick={uploadPdf}
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-white font-bold transition-all ${
                loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:scale-95"
              }`}
            >
              {loading && !quizData && !summary ? "Processing..." : "Generate Summary"}
            </button>

            <button
              onClick={generateQuiz}
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-white font-bold transition-all ${
                loading ? "bg-purple-300 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700 active:scale-95"
              }`}
            >
              {loading && quizData ? "Loading Quiz..." : "Take a Quiz"}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Summary Results */}
        {summary && (
          <div className="bg-white shadow-lg rounded-2xl p-8 mb-8 animate-fade-in border border-blue-50">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">📝</span> Summary
            </h2>
            <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {summary}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {/* Secondary Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <section className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📇 Flashcards</h2>
            <Flashcards file={file} />
          </section>

          <section className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">🏫 Google Classroom</h2>
            <GoogleClassroom />
          </section>
        </div>
      </div>
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