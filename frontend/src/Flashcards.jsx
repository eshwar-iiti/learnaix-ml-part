import { useState } from "react";

const DEFAULT_CARDS = [
  {
    question: "Click Generate Flashcards",
    answer: "Your flashcards will appear here"
  }
];

function Flashcards({ file }) {
  const [cards, setCards] = useState(DEFAULT_CARDS);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateFlashcards = async () => {
    if (!file) {
      setError("Please upload a PDF first");
      return;
    }

    setError("");
    setLoading(true);
    setIndex(0);
    setFlipped(false);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:8000/flashcards", {
        method: "POST",
        body: formData
      });

      const rawData = await res.text();

      let data;
      try {
        data = JSON.parse(rawData);
      } catch (e) {
        console.error("JSON parse failed:", e, "RAW OUTPUT:", rawData);
        throw new Error("Failed to parse flashcard data");
      }

      if (!res.ok || !Array.isArray(data.flashcards)) {
        throw new Error("Invalid flashcard response");
      }

      if (data.flashcards.length === 0) {
        throw new Error("No flashcards generated");
      }

      setCards(data.flashcards);
    } catch (err) {
      console.error(err);
      setError("Failed to generate flashcards");
      setCards(DEFAULT_CARDS);
    } finally {
      setLoading(false);
    }
  };

  const nextCard = () => {
    setFlipped(false);
    setIndex((prev) => (prev + 1) % cards.length);
  };

  const card = cards[index] || DEFAULT_CARDS[0];

  return (
    <div>
      <button
        onClick={generateFlashcards}
        style={{
          padding: "10px 20px",
          borderRadius: "6px",
          border: "none",
          background: "#4f46e5",
          color: "white",
          fontSize: "16px",
          cursor: "pointer"
        }}
      >
        Generate Flashcards
      </button>

      {loading && <p>⏳ Generating...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Card container */}
      <div
        style={{
          marginTop: "30px",
          width: "100%",
          maxWidth: "600px",
          height: "200px",
          perspective: "1000px",
          margin: "30px auto",
          cursor: "pointer",
          color: "black"
        }}
        onClick={() => setFlipped(!flipped)}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            transformStyle: "preserve-3d",
            transition: "transform 0.6s",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)"
          }}
        >
          {/* Front */}
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              backfaceVisibility: "hidden",
              borderRadius: "12px",
              backgroundColor: "#e0f2fe",
              boxShadow: "0 12px 30px rgba(0,0,0,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              fontSize: "18px",
              fontWeight: 500,
              padding: "20px",
              whiteSpace: "pre-wrap"
            }}
          >
            {card.question}
          </div>

          {/* Back */}
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              backfaceVisibility: "hidden",
              borderRadius: "12px",
              backgroundColor: "#fef3c7",
              boxShadow: "0 12px 30px rgba(0,0,0,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              fontSize: "18px",
              fontWeight: 500,
              padding: "20px",
              transform: "rotateY(180deg)",
              whiteSpace: "pre-wrap"
            }}
          >
            {card.answer}
          </div>
        </div>
      </div>

      <button
        onClick={nextCard}
        disabled={cards.length <= 1}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          borderRadius: "6px",
          border: "none",
          background: cards.length <= 1 ? "#9ca3af" : "#4f46e5",
          color: "white",
          fontSize: "16px",
          cursor: cards.length <= 1 ? "not-allowed" : "pointer"
        }}
      >
        Next Card →
      </button>
    </div>
  );
}

export default Flashcards;
