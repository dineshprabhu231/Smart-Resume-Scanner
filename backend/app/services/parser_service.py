"""
Resume Parser Service
Extracts raw text from PDF and DOCX files.
Uses pdfplumber (primary) → PyPDF2 (fallback) for PDFs.
"""

import os
import logging

logger = logging.getLogger(__name__)


def extract_text_from_file(filepath: str) -> str:
    """Extract text from a PDF or DOCX file. Returns empty string on failure."""
    ext = os.path.splitext(filepath)[1].lower()

    if ext == ".pdf":
        return _extract_from_pdf(filepath)
    elif ext in (".docx", ".doc"):
        return _extract_from_docx(filepath)
    else:
        logger.warning(f"Unsupported file type: {ext}")
        return ""


def _extract_from_pdf(filepath: str) -> str:
    """Try pdfplumber first, fall back to PyPDF2."""
    text = ""

    # Primary: pdfplumber (better layout preservation)
    try:
        import pdfplumber
        with pdfplumber.open(filepath) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        if text.strip():
            return text
    except Exception as e:
        logger.warning(f"pdfplumber failed: {e}, trying PyPDF2")

    # Fallback: PyPDF2
    try:
        import PyPDF2
        with open(filepath, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        logger.error(f"PyPDF2 also failed: {e}")

    return text


def _extract_from_docx(filepath: str) -> str:
    """Extract text from a DOCX file using python-docx."""
    try:
        from docx import Document
        doc = Document(filepath)
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        return "\n".join(paragraphs)
    except Exception as e:
        logger.error(f"DOCX extraction failed: {e}")
        return ""
