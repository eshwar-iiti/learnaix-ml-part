import React, { useState } from 'react';

const Quiz = ({ quizData, onBack }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // --- 🛡️ CRITICAL FIX: Handle Empty/Null Data ---
  // If the backend fails (e.g., "Ranklist" error), quizData might be null or [].
  // Instead of crashing, we show a helpful message.
  if (!quizData || quizData.length === 0) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center border border-red-100 max-w-2xl mx-auto mt-10">
        <h3 className="text-xl font-bold text-red-600 mb-4">⚠️ Unable to Start Quiz</h3>
        <p className="text-gray-600 mb-8">
          The AI couldn't generate valid questions from this file. It might be a raw data file (like a ranklist) or contain insufficient text.
        </p>
        <button
          onClick={onBack}
          className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const handleOptionClick = (key) => {
    if (isAnswered) return;
    setSelectedOption(key);
    setIsAnswered(true);

    // Safe access to the answer
    const currentQuestion = quizData[currentIdx];
    if (currentQuestion && key === currentQuestion.answer) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIdx + 1 < quizData.length) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  if (showResult) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center border border-gray-100 max-w-2xl mx-auto mt-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Quiz Complete! 🎉</h2>
        <div className="text-6xl font-extrabold text-blue-600 mb-4">{score} / {quizData.length}</div>
        <p className="text-gray-500 mb-8 font-medium">
          You scored {Math.round((score / quizData.length) * 100)}%
        </p>
        <button onClick={onBack} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Safe question retrieval
  const currentQ = quizData[currentIdx];

  // Final safety net: if currentQ is somehow undefined, don't render anything
  if (!currentQ) return null;

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 text-gray-900 max-w-2xl mx-auto mt-10">
      <div className="flex justify-between items-center mb-6">
        <span className="text-sm font-bold text-purple-600 uppercase tracking-wider">
          Question {currentIdx + 1} of {quizData.length}
        </span>
        <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
            History
        </span>
      </div>

      <h3 className="text-xl font-bold mb-8 leading-snug">{currentQ.question}</h3>

      <div className="space-y-3">
        {Object.entries(currentQ.options).map(([key, value]) => {
          let btnClass = "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ";

          if (!isAnswered) {
            btnClass += "border-gray-100 hover:border-blue-400 hover:bg-blue-50 text-gray-700";
          } else {
            // Logic for showing Correct/Incorrect colors
            if (key === currentQ.answer) {
                btnClass += "border-green-500 bg-green-50 text-green-800";
            } else if (key === selectedOption) {
                btnClass += "border-red-500 bg-red-50 text-red-800";
            } else {
                btnClass += "border-gray-100 opacity-50 text-gray-400";
            }
          }

          return (
            <button key={key} onClick={() => handleOptionClick(key)} className={btnClass}>
              <span className="font-extrabold mr-3 opacity-70">{key}.</span> {value}
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <div className="mt-8">
            <button
                onClick={nextQuestion}
                className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-black shadow-lg hover:shadow-xl transition-all"
            >
            {currentIdx + 1 === quizData.length ? "Finish Quiz 🏁" : "Next Question →"}
            </button>
        </div>
      )}
    </div>
  );
};

export default Quiz;