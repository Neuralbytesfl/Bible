import json
import pyttsx3
import os

# Function to load Bible data from a JSON file
def load_bible_data(json_file_path):
    with open(json_file_path, 'r') as file:
        bible_data = json.load(file)
    return bible_data

# Function to convert text to speech and save it to an audio file
def text_to_speech(text, output_path):
    engine = pyttsx3.init()
    
    # Set properties for the voice (optional, you can adjust as needed)
    engine.setProperty('rate', 150)  # Speed of speech
    engine.setProperty('volume', 1)  # Volume level (0.0 to 1.0)

    # Save the speech to an audio file
    engine.save_to_file(text, output_path)
    engine.runAndWait()

# Function to convert each verse to an audio file
def convert_bible_to_audio(bible_data, output_folder):
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    for book, chapters in bible_data.items():
        book_folder = os.path.join(output_folder, book)
        
        # Create a directory for the book if it doesn't exist
        if not os.path.exists(book_folder):
            os.makedirs(book_folder)

        for chapter, verses in chapters.items():
            chapter_folder = os.path.join(book_folder, f"Chapter_{chapter}")
            
            # Create a directory for the chapter
            if not os.path.exists(chapter_folder):
                os.makedirs(chapter_folder)

            for verse_number, verse_text in verses.items():
                verse_audio_path = os.path.join(chapter_folder, f"Verse_{verse_number}.mp3")
                
                # Only include the verse text in the audio (without book, chapter, or verse number)
                print(f"Converting {verse_number} from Chapter {chapter} of {book} to audio...")
                
                # Convert the verse to speech and save it as an audio file
                text_to_speech(verse_text, verse_audio_path)

# Main function
def main():
    bible_file = 'bible_output.json'  # Path to your JSON file
    output_folder = 'Bible_Audio'  # Folder where audio files will be saved

    # Load the Bible data
    bible_data = load_bible_data(bible_file)

    # Convert the Bible to audio files
    convert_bible_to_audio(bible_data, output_folder)

if __name__ == "__main__":
    main()
