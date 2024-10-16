from flask import Flask, render_template, jsonify, send_from_directory, request
import json
import os

app = Flask(__name__)

# Load the Bible data from a JSON file
with open('bible_output.json', 'r') as file:
    bible_data = json.load(file)

# Route for the main page
@app.route('/')
def index():
    book = request.args.get('book', 'Ge')  # Default to Genesis if no book is specified
    chapter = request.args.get('chapter', '1')  # Default to Chapter 1 if no chapter is specified
    return render_template('index.html', book=book, chapter=chapter)

# API to get Bible data for a specific book and chapter
@app.route('/api/<book>/<chapter>')
def get_bible_chapter(book, chapter):
    book_data = bible_data.get(book, {})
    chapter_data = book_data.get(str(chapter), {})
    return jsonify(chapter_data)

# API to get the number of chapters for a specific book
@app.route('/api/<book>/chapters')
def get_chapter_count(book):
    book_data = bible_data.get(book, {})
    chapter_count = len(book_data)
    return jsonify({"chapters": chapter_count})

# Serve audio files from the static/Bible_Audio directory
@app.route('/Bible_Audio/<path:filename>')
def get_audio(filename):
    audio_directory = os.path.join(app.root_path, 'static', 'Bible_Audio')
    return send_from_directory(audio_directory, filename)

if __name__ == '__main__':
    app.run(debug=True)
