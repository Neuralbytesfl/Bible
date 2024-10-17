import json
import os
import comtypes.client
import comtypes
from pydub import AudioSegment
import threading
import queue
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler("bible_audio.log"),
        logging.StreamHandler()
    ]
)

# Function to load Bible data from a JSON file
def load_bible_data(json_file_path):
    try:
        with open(json_file_path, 'r', encoding='utf-8') as file:
            bible_data = json.load(file)
        logging.info(f"Successfully loaded Bible data from {json_file_path}.")
        return bible_data
    except Exception as e:
        logging.error(f"Failed to load Bible data: {e}")
        raise

# Function to convert text to speech and save it to a WAV file
def text_to_speech(text, output_wav_path):
    try:
        # Initialize COM for this thread
        comtypes.CoInitialize()

        speaker = comtypes.client.CreateObject("SAPI.SpVoice")
        
        # Create a file stream to save as WAV
        stream = comtypes.client.CreateObject("SAPI.SpFileStream")
        stream.Open(output_wav_path, 3)  # Mode 3 is for writing (create new file)

        # Set the output stream to the file
        speaker.AudioOutputStream = stream
        speaker.Speak(text)

        # Close the stream after writing
        stream.Close()

        logging.info(f"Successfully generated WAV: {output_wav_path}")
    except Exception as e:
        logging.error(f"Error generating WAV for {output_wav_path}: {e}")
    finally:
        # Uninitialize COM after the task is done
        comtypes.CoUninitialize()

# Function to generate a single WAV file
def generate_wav(book, chapter, verse_number, verse_text, output_folder, wav_queue):
    try:
        book_folder = os.path.join(output_folder, book)
        chapter_folder = os.path.join(book_folder, f"Chapter_{chapter}")
        
        # Create necessary directories
        os.makedirs(chapter_folder, exist_ok=True)
        
        verse_wav_path = os.path.join(chapter_folder, f"Verse_{verse_number}.wav")
        
        logging.info(f"Generating WAV for Verse {verse_number} from Chapter {chapter} of {book}...")
        text_to_speech(verse_text, verse_wav_path)

        # If WAV generation was successful, put the path into the queue for conversion
        if os.path.exists(verse_wav_path):
            wav_queue.put(verse_wav_path)
    except Exception as e:
        logging.error(f"Error in generate_wav for {book} Chapter {chapter} Verse {verse_number}: {e}")

# Function to convert a WAV file to MP3 using pydub
def convert_wav_to_mp3(wav_file):
    try:
        mp3_file = wav_file.replace(".wav", ".mp3")
        sound = AudioSegment.from_wav(wav_file)
        sound.export(mp3_file, format="mp3")
        logging.info(f"Converted {wav_file} to {mp3_file}")
        os.remove(wav_file)  # Delete the original WAV file after conversion
        logging.info(f"Deleted original WAV file: {wav_file}")
    except Exception as e:
        logging.error(f"Error converting {wav_file} to MP3: {e}")

# Converter thread function
def converter_thread_func(wav_queue, stop_event):
    while not stop_event.is_set() or not wav_queue.empty():
        try:
            wav_file = wav_queue.get(timeout=1)  # Wait for a WAV file
            convert_wav_to_mp3(wav_file)
            wav_queue.task_done()
        except queue.Empty:
            continue
        except Exception as e:
            logging.error(f"Unexpected error in converter thread: {e}")

# Main function
def main():
    bible_file = 'bible_output.json'  # Path to your JSON file
    output_folder = 'Bible_Audio'  # Folder where audio files will be saved

    # Load the Bible data
    bible_data = load_bible_data(bible_file)

    # Initialize a queue for WAV files to be converted
    wav_queue = queue.Queue()

    # Event to signal converter threads to stop
    stop_event = threading.Event()

    # Start converter threads
    num_converter_threads = os.cpu_count() or 4  # Use number of CPU cores or default to 4
    converter_threads = []
    for _ in range(num_converter_threads):
        t = threading.Thread(target=converter_thread_func, args=(wav_queue, stop_event))
        t.start()
        converter_threads.append(t)

    # Generate WAV files sequentially
    try:
        for book, chapters in bible_data.items():
            for chapter, verses in chapters.items():
                for verse_number, verse_text in verses.items():
                    generate_wav(book, chapter, verse_number, verse_text, output_folder, wav_queue)
    except Exception as e:
        logging.error(f"Exception during WAV generation: {e}")
    finally:
        # Wait until all WAV files have been put into the queue
        wav_queue.join()

        # Signal converter threads to stop
        stop_event.set()

        # Wait for all converter threads to finish
        for t in converter_threads:
            t.join()

    logging.info("All WAV files have been generated and converted to MP3.")

if __name__ == "__main__":
    main()
