
Bible Audio Player
This project is a Bible Audio Player designed to play Bible verses chapter by chapter, book by book, continuously until the entire Bible is played. It allows you to search for specific chapters or verses and automatically continues to the next chapter and book when one finishes.

Features
Continuous Audio Playback: Automatically moves to the next verse, chapter, or book as each audio clip finishes, allowing for seamless playback.
Search Functionality: Search by book, chapter, or verse with dynamic suggestions as you type.
Verse Highlighting: Each verse is highlighted as it's played, helping you follow along.
Supports Auto-Play and Pause/Resume: You can pause or resume the audio at any time, and it remembers where it left off.
Responsive Design: Optimized for both desktop and mobile devices, providing a great user experience.
Audio Files
Pre-generated Audio
The Bible Audio used in this project is pre-generated as MP3 files, totaling around 11GB. These audio files are distributed to save CPU load when streamed across the internet. This ensures consistent performance during playback.

Dynamic Audio Generation (Optional)
For setups where disk space is a concern or real-time audio conversion is preferred, you can configure the player to generate audio on the fly using a Text-to-Speech (TTS) engine like gTTS (Google Text-to-Speech) or another TTS API.

How to Enable On-the-Fly Audio Conversion:
Install gTTS (or any other TTS engine of your choice):

bash
Copy code
pip install gtts
In the app.py code, modify the audio handling to convert Bible text into speech dynamically if the MP3 file is not already available.

Example:

python
Copy code
from gtts import gTTS

@app.route('/Bible_Audio/<book>/<chapter>/<verse>')
def get_audio(book, chapter, verse):
    audio_path = f"static/Bible_Audio/{book}/Chapter_{chapter}/Verse_{verse}.mp3"
    if not os.path.exists(audio_path):
        # Get the verse text from your JSON data or database
        verse_text = get_verse_text(book, chapter, verse)  
        tts = gTTS(verse_text)
        tts.save(audio_path)
    
    return send_from_directory(os.path.dirname(audio_path), os.path.basename(audio_path))
This way, the player will convert the text into audio and store it locally for future use, saving resources while still providing flexibility.

Setup Instructions
Clone the repository.
Ensure you have the Bible text JSON file (included) in the appropriate folder.
Choose between using pre-generated audio files or real-time audio generation as explained above.
Run the application.
