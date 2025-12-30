import os
import google.generativeai as genai
from dotenv import load_dotenv
import json

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-flash-latest")
import json
import re

# def generate_flashcards(notes: str, n_cards: int = 10):
#     prompt = f"""
# You are an academic assistant.

# From the notes below, generate exactly {n_cards} high-quality flashcards.

# Rules:
# - Questions must test understanding, not just definitions
# - Answers must be concise but complete
# - Do NOT add external information
# - Return ONLY valid JSON
# - No markdown
# - No explanations
# - JSON format only:

# [
#   {{
#     "question": "Question text",
#     "answer": "Answer text"
#   }}
# ]

# Notes:
# {notes[:12000]}
# """

#     print("Generating flashcards...")
#     response = model.generate_content(prompt)
#     print("Flashcards generated")

#     text = response.text.strip()

#     # 🔹 Remove ```json ``` if Gemini adds it
#     text = re.sub(r"^```json|```$", "", text).strip()

#     try:
#         return json.loads(text)
#     except Exception as e:
#         print("JSON parse failed:", e)
#         print("Raw output:", text)
#         return []
import re
import json

import re
import json

def safe_json_loads(raw: str):
    """
    Fix invalid JSON escapes caused by LaTeX (\pi, \cos, \frac, etc.)
    """
    # Escape any backslash NOT followed by a valid JSON escape
    fixed = re.sub(r'\\(?!["\\/bfnrtu])', r'\\\\', raw)
    return json.loads(fixed)


import json
import re

import json
import re

def generate_flashcards(notes: str, n_cards: int = 10):
    prompt = f"""
You are an academic assistant.

Generate exactly {n_cards} flashcards from the notes.

Rules:
- Questions and answers must be plain text
- DO NOT use LaTeX or symbols
- Output ONLY valid JSON (no markdown)

Format:
[
  {{
    "question": "...",
    "answer": "..."
  }}
]

Notes:
{notes}
"""

    response = model.generate_content(prompt)
    raw = response.text.strip()

    # 🔥 STRIP MARKDOWN CODE FENCES
    raw = re.sub(r"^```json\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)

    # (Optional safety)
    raw = raw.replace("\\", "").replace("$", "")

    try:
        return json.loads(raw)
    except Exception as e:
        print("JSON parse failed:", e)
        print("RAW OUTPUT:", raw)
        return []
