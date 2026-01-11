import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-flash-latest")


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

        User message:
        {text}

        TASK:
        1. Write a helpful response to the user.
        2. Write a short privacy-safe summary of ONLY the new information.
        3. Give your responses in a teaching tone and make sure to reply in markdown format for the summary.
        FORMAT YOUR OUTPUT EXACTLY AS:
        RESPONSE:
        <your response>

        SUMMARY:
        <your summary>
        """

    response = model.generate_content(prompt)

    raw_text = response.text.strip()

    # 🔹 Parse structured output safely
    answer, summary = parse_output(raw_text)
    print("ANSWER:", answer)
    print("SUMMARY:", summary)
    return answer, summary


def parse_output(text: str):
    answer = ""
    summary = ""

    if "SUMMARY:" in text:
        answer_part, summary_part = text.split("SUMMARY:", 1)
        answer = answer_part.replace("RESPONSE:", "").strip()
        summary = summary_part.strip()
    else:
        answer = text
        summary = "No new long-term information."

    return answer, summary
