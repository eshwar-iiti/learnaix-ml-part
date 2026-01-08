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

# Load environment variables
load_dotenv()

# Initialize the new Client
# Ensure GEMINI_API_KEY is in your .env file
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def generate_quiz(text: str, n_questions: int = 5):
    print("\n--- QUIZ GENERATION START ---")

    # 1. Input Validation
    if not text or len(text.strip()) < 50:
        print("❌ ERROR: Text is empty or too short.")
        return []

    # 2. Define the Schema for Strict JSON Output
    # The new SDK handles schemas more cleanly using the 'response_schema' config
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
        print("📡 Sending request to Gemini (New SDK)...")

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

        # 3. Parse Response
        # In the new SDK, response.text contains the raw JSON string
        if not response.text:
            print("❌ ERROR: Empty response from AI.")
            return []

        parsed_data = json.loads(response.text)
        print(f"✅ Generated {len(parsed_data)} questions.")
        return parsed_data

    except Exception as e:
        print(f"❌ QUIZ ERROR: {e}")
        return []
from pdf_utils import extract_text_from_pdf
txt = extract_text_from_pdf(r"C:\Users\ESHWAR\OneDrive\Desktop\Programs\gdsc\backend\uploads\AI_ml (1).pdf")

# print(generate_quiz(txt,2))
# --- TEST BLOCK ---
# This ensures that when you run 'python quiz.py', it actually DOES something.