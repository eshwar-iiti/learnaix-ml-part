from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
from pdf_utils import extract_text_from_pdf , extract_text_from_pdf_url
from gemini import summarize_text  # your existing summarization function
import google.generativeai as genai
from dotenv import load_dotenv
from flashcards import generate_flashcards
from quiz import generate_quiz
import pdfplumber
# Load Gemini API key from .env
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
import cloudinary
import cloudinary.uploader

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)
def upload_pdf_to_cloudinary(file):
    result = cloudinary.uploader.upload(
        file.file,
        resource_type="raw",   # IMPORTANT for PDFs
        folder="pdf_uploads"
    )
    return result["secure_url"]

app = FastAPI()

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8000/summarize",
        "http://127.0.0.1:8000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# UPLOAD_DIR = "uploads"
# os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.get("/")
def root():
    return {"status": "backend running"}

from fastapi import HTTPException

@app.post("/summarize")
async def summarize_pdf(file: UploadFile = File(...)):
    try:
        if file.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="Only PDF files allowed")

        pdf_url = upload_pdf_to_cloudinary(file)

        text = extract_text_from_pdf_url(pdf_url)
        if not text.strip():
            raise HTTPException(status_code=400, detail="No text found in PDF")

        text = text[:10000]
        summary = summarize_text(text)

        return {"summary": summary}

    except Exception as e:
        print("ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/flashcards")
async def flashcards(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        return {"error": "Only PDF files allowed"}

    # text = extract_text_from_pdf(file.file)
    pdf_url = upload_pdf_to_cloudinary(file)

    # text = extract_text_from_pdf(file_path)
    text = extract_text_from_pdf_url(pdf_url)
    if not text.strip():
        return {"error": "No text found in PDF"}

    # limit tokens but keep coverage
    text = text[:12000]

    cards = generate_flashcards(text, n_cards=10)

    return {
        "flashcards": cards
    }

async def process_file(file: UploadFile):
    if file.content_type != "application/pdf":
        return {"error": "Only PDF files allowed"}

    # text = extract_text_from_pdf(file.file)
    pdf_url = upload_pdf_to_cloudinary(file)

    # text = extract_text_from_pdf(file_path)
    text = extract_text_from_pdf_url(pdf_url)
    return text

@app.post("/quiz")
async def quiz_endpoint(file: UploadFile = File(...)):
    text = await process_file(file)

    print(f"DEBUG: Extracting quiz from {len(text)} chars...")

    # Generate Quiz
    quiz_data = generate_quiz(text, n_questions=5)

    return {"quiz": quiz_data}

from mention import get_response

@app.post("/mention")
async def mention(payload: dict):
    text = payload["text"]
    memory = payload.get("memory", "")

    answer, summary = get_response(text, memory)

    return {
        "response": answer,
        "summary": summary
    }


# Add this import at the top
from google_classroom import router as google_router

# Add this line where you create your FastAPI app
# (after app = FastAPI())
app.include_router(google_router)