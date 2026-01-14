# import os
# from google import genai
# from google.genai import types


# client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


# def get_response(text: str, memory: str = ""):
#     """
#     text   : current @AI mention message
#     memory : privacy-safe summary from previous turns
#     """

#     prompt = f"""
#         You are an AI assistant helping users in a group chat.

#         IMPORTANT RULES:
#         - Respect privacy
#         - Do NOT include usernames or personal details
#         - Use only the provided summary as memory

#         Previous context summary:
#         {memory if memory else "None"}

#         User message:
#         {text}

#         TASK:
#         1. Write a helpful response to the user.
#         2. Write a short privacy-safe summary of ONLY the new information.

#         FORMAT YOUR OUTPUT EXACTLY AS:
#         RESPONSE:
#         <your response>

#         SUMMARY:
#         <your summary>
#         """

#     response = client.models.generate_content(
#         model="gemini-flash-latest",
#         contents=prompt
#     )

#     raw_text = response.text.strip()

#     # 🔹 Parse structured output safely
#     answer, summary = parse_output(raw_text)

#     return answer, summary


# def parse_output(text: str):
#     answer = ""
#     summary = ""

#     if "SUMMARY:" in text:
#         answer_part, summary_part = text.split("SUMMARY:", 1)
#         answer = answer_part.replace("RESPONSE:", "").strip()
#         summary = summary_part.strip()
#     else:
#         answer = text
#         summary = "No new long-term information."

#     return answer, summary

import os
import json
from google import genai
from google.genai import types


client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def get_response(text: str, memory: str = ""):
    """
    text   : current @AI mention message
    memory : privacy-safe summary from previous turns
    """

    prompt = f"""
        You are an AI assistant helping users in a group chat.

        IMPORTANT RULES:
        - Respect privacy
        - Do NOT include usernames or personal details
        - Use only the provided summary as memory

        Previous context summary:
        {memory if memory else "None"}

Current Question:
{text}

Provide a helpful educational response and create a brief privacy-safe summary (max 2 sentences) of only the new academic content discussed."""

    try:
        # Use JSON mode for reliable structured output
        response = client.models.generate_content(
            model="gemini-flash-latest",
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.7,
                response_mime_type="application/json",
                response_schema={
                    "type": "object",
                    "properties": {
                        "response": {"type": "string"},
                        "summary": {"type": "string"}
                    },
                    "required": ["response", "summary"]
                }
            )
        )
        
        result = json.loads(response.text)
        answer = result.get("response", "I apologize, I couldn't generate a response.")
        summary = result.get("summary", "Unable to generate summary.")
        
    except (json.JSONDecodeError, Exception) as e:
        # Fallback to text parsing if JSON fails
        print(f"JSON parsing failed: {e}, falling back to text parsing")
        
        response = client.models.generate_content(
            model="gemini-flash-latest",
            contents=prompt + "\n\nFormat: RESPONSE:\n<response>\n\nSUMMARY:\n<summary>"
        )
        
        answer, summary = parse_output(response.text.strip())
    
    return answer, summary


def parse_output(text: str):
    """Fallback parser for non-JSON responses."""
    answer = ""
    summary = ""

    if "SUMMARY:" in text:
        parts = text.split("SUMMARY:", 1)
        answer = parts[0].replace("RESPONSE:", "").strip()
        summary = parts[1].strip()
    else:
        answer = text.replace("RESPONSE:", "").strip()
        summary = "No new information to summarize."

    return answer, summary