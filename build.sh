#!/bin/bash
echo "Installing backend requirements..."
pip install -r requirements.txt

echo "Downloading SpaCy model..."
python -m spacy download en_core_web_sm

echo "Building frontend..."
cd frontend
npm install
npm run build
