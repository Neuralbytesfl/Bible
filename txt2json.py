import json
import re

def bible_to_json(file_path, output_json_path):
    books = set()  # To keep track of book names
    bible_data = {}

    with open(file_path, 'r') as file:
        for line in file:
            # Ensure line is not empty
            if line.strip():
                try:
                    # Use regex to capture the reference and verse
                    match = re.match(r'([0-9]*[A-Za-z]+)(\d+):(\d+)\s(.+)', line.strip())
                    if match:
                        book = match.group(1)  # Book name, including numbers if present (e.g., '2Jn')
                        chapter = int(match.group(2))  # Chapter number (e.g., 1)
                        verse_number = int(match.group(3))  # Verse number (e.g., 1)
                        verse = match.group(4)  # Verse text

                        # Add book name to the list
                        books.add(book)

                        # Organize data by book, chapter, and verse
                        if book not in bible_data:
                            bible_data[book] = {}

                        if chapter not in bible_data[book]:
                            bible_data[book][chapter] = {}

                        bible_data[book][chapter][verse_number] = verse
                    else:
                        print(f"Warning: Line format is incorrect: {line.strip()}")

                except ValueError as e:
                    print(f"Error processing line: {line.strip()} - {e}")

    # Sort each chapter's verses in order
    for book in bible_data:
        for chapter in bible_data[book]:
            sorted_verses = dict(sorted(bible_data[book][chapter].items()))
            bible_data[book][chapter] = sorted_verses

    # Save to JSON file
    with open(output_json_path, 'w') as json_file:
        json.dump(bible_data, json_file, indent=4)

    # Also return sorted list of books
    sorted_books = sorted(books)
    return sorted_books

# Replace 'bible.txt' with the path to your file, and 'bible_output.json' with the desired output file name
book_list = bible_to_json('bible.txt', 'bible_output.json')

# Print the list of books to confirm
print(f"Books found: {book_list}")
