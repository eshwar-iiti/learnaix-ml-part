import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv
import warnings
warnings.filterwarnings(
    "ignore",
    message="Field name .* shadows an attribute in parent .*"
)

# load environment variables
load_dotenv()

#load gemini key
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def generate_quiz(text: str, n_questions: int = 5):
    print("\n--- QUIZ GENERATION START ---")

    if not text or len(text.strip()) < 50:
        print("ERROR: Text is empty or too short.")
        return []

    quiz_schema = {
        "type": "ARRAY",
        "items": {
            "type": "OBJECT",
            "properties": {
                "question": {"type": "STRING"},
                "options": {
                    "type": "OBJECT",
                    "properties": {
                        "A": {"type": "STRING"},
                        "B": {"type": "STRING"},
                        "C": {"type": "STRING"},
                        "D": {"type": "STRING"},
                    },
                    "required": ["A", "B", "C", "D"]
                },
                "answer": {"type": "STRING"}
            },
            "required": ["question", "options", "answer"]
        }
    }

    prompt = f"""
    Analyze the provided text and generate exactly {n_questions} multiple-choice questions.

    CRITICAL INSTRUCTIONS:
    1. If the text is **educational content**, ask conceptual questions.
    2. If the text is **structured data** (like a ranklist, scoreboard, or table), ask data-analysis questions (e.g., "Which team secured Rank 1?", "What is the score of X?").
    3. If the text is insufficient or random noise, return an empty array.

    Text Content:
    {text[:15000]}
    """

    try:
        print("Generating Quiz")

        response = client.models.generate_content(
            model="gemini-flash-latest",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=quiz_schema,
                temperature=1.0,
                max_output_tokens=8192,
            )
        )

        if not response.text:
            print("ERROR: Empty response from AI.")
            return []

        parsed_data = json.loads(response.text)
        print(f"Generated {len(parsed_data)} questions.")
        return parsed_data

    except Exception as e:
        print(f"QUIZ ERROR: {e}")
        return []
