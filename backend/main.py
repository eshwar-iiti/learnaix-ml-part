from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
from pdf_utils import extract_text_from_pdf
from gemini import summarize_text  # your existing summarization function
import google.generativeai as genai
from dotenv import load_dotenv
from flashcards import generate_flashcards

# Load Gemini API key from .env
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI()

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.get("/")
def root():
    return {"status": "backend running"}


@app.post("/summarize")
async def summarize_pdf(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        return {"error": "Only PDF files allowed"}

    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    text = extract_text_from_pdf(file_path)

    if len(text.strip()) == 0:
        return {"error": "No text found in PDF"}

    text = text[:10000]  # limit text length

    summary = summarize_text(text)

    return {"summary": summary}

@app.post("/flashcards")
async def flashcards(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        return {"error": "Only PDF files allowed"}

    text = extract_text_from_pdf(file.file)

    if not text.strip():
        return {"error": "No text found in PDF"}

    # limit tokens but keep coverage
    text = text[:12000]

    cards = generate_flashcards(text, n_cards=10)

    return {
        "flashcards": cards
    }
