let currentBook = getQueryParam('book', 'Ge');  // Default to Genesis or the book from the URL
let currentChapter = parseInt(getQueryParam('chapter', '1'));  // Default to Chapter 1
let currentVerse = 1;    // Track the current verse being read
let audioPlayer = new Audio();  // Audio player for playing verse audio
let autoPlay = true;      // Auto-play flag

// Canonical order of Bible books (as they appear in your folder structure)
const bookOrder = [
    "Ge", "Exo", "Lev", "Num", "Deu", "Josh", "Jdgs", "Ruth", "1Sm", "2Sm", "1Ki", "2Ki", "1Chr", "2Chr", 
    "Ezra", "Neh", "Est", "Job", "Psa", "Prv", "Eccl", "SSol", "Isa", "Jer", "Lam", "Eze", "Dan",
    "Hos", "Joel", "Amos", "Obad", "Jonah", "Mic", "Nahum", "Hab", "Zep", "Hag", "Zec", "Mal", "Mat", 
    "Mark", "Luke", "John", "Acts", "Rom", "1Cor", "2Cor", "Gal", "Eph", "Phi", "Col", "1Th", "2Th", 
    "1Tim", "2Tim", "Titus", "Phmn", "Heb", "Jas", "1Pet", "2Pet", "1Jn", "2Jn", "3Jn", "Jude", "Rev"
];

// Mapping of folder names to full book names
const bookNames = {
    "Ge": "Genesis", "Exo": "Exodus", "Lev": "Leviticus", "Num": "Numbers", "Deu": "Deuteronomy",
    "Josh": "Joshua", "Jdgs": "Judges", "Ruth": "Ruth", "1Sm": "1 Samuel", "2Sm": "2 Samuel",
    "1Ki": "1 Kings", "2Ki": "2 Kings", "1Chr": "1 Chronicles", "2Chr": "2 Chronicles",
    "Ezra": "Ezra", "Neh": "Nehemiah", "Est": "Esther", "Job": "Job", "Psa": "Psalms",
    "Prv": "Proverbs", "Eccl": "Ecclesiastes", "SSol": "Song of Solomon", "Isa": "Isaiah",
    "Jer": "Jeremiah", "Lam": "Lamentations", "Eze": "Ezekiel", "Dan": "Daniel",
    "Hos": "Hosea", "Joel": "Joel", "Amos": "Amos", "Obad": "Obadiah", "Jonah": "Jonah",
    "Mic": "Micah", "Nahum": "Nahum", "Hab": "Habakkuk", "Zep": "Zephaniah", "Hag": "Haggai",
    "Zec": "Zechariah", "Mal": "Malachi", "Mat": "Matthew", "Mark": "Mark", "Luke": "Luke",
    "John": "John", "Acts": "Acts", "Rom": "Romans", "1Cor": "1 Corinthians", "2Cor": "2 Corinthians",
    "Gal": "Galatians", "Eph": "Ephesians", "Phi": "Philippians", "Col": "Colossians",
    "1Th": "1 Thessalonians", "2Th": "2 Thessalonians", "1Tim": "1 Timothy", "2Tim": "2 Timothy",
    "Titus": "Titus", "Phmn": "Philemon", "Heb": "Hebrews", "Jas": "James", "1Pet": "1 Peter",
    "2Pet": "2 Peter", "1Jn": "1 John", "2Jn": "2 John", "3Jn": "3 John", "Jude": "Jude", "Rev": "Revelation"
};

document.addEventListener('DOMContentLoaded', function () {
    loadChapter(currentBook, currentChapter);

    document.getElementById('next-button').addEventListener('click', function() {
        fetch(`/api/${currentBook}/chapters`)
            .then(response => response.json())
            .then(data => {
                const chapterCount = data.chapters;
                if (currentChapter < chapterCount) {
                    currentChapter++;
                    loadChapter(currentBook, currentChapter);
                } else {
                    moveToNextBook();
                }
            });
    });

    document.getElementById('prev-button').addEventListener('click', function() {
        if (currentChapter > 1) {
            currentChapter--;
            loadChapter(currentBook, currentChapter);
        } else {
            moveToPreviousBook();
        }
    });

    document.getElementById('pause-button').addEventListener('click', function() {
        audioPlayer.pause();
        autoPlay = false;
        document.getElementById('pause-button').style.display = 'none';
        document.getElementById('resume-button').style.display = 'block';
    });

    document.getElementById('resume-button').addEventListener('click', function() {
        audioPlayer.play();
        autoPlay = true;
        document.getElementById('resume-button').style.display = 'none';
        document.getElementById('pause-button').style.display = 'block';
    });

    // Add search functionality
    document.getElementById('search-box').addEventListener('input', searchSuggestions);
});

function loadChapter(book, chapter) {
    if (!bookOrder.includes(book) || isNaN(chapter) || chapter < 1) {
        // If invalid book or chapter, redirect to Genesis 1
        window.location.href = `/?book=Ge&chapter=1`;
        return;
    }

    // Update URL to match the current book and chapter
    window.history.pushState({}, '', `/?book=${book}&chapter=${chapter}`);

    fetch(`/api/${book}/${chapter}`)
        .then(response => response.json())
        .then(data => {
            const bibleText = document.getElementById('bible-text');
            bibleText.innerHTML = '';
            currentVerse = 1;

            // Display the full name of the book and the current chapter
            const bookName = bookNames[book] || "Unknown";
            document.getElementById('book-chapter').innerText = `Book: ${bookName}, Chapter: ${chapter}`;

            Object.keys(data).forEach(verseNumber => {
                let verseText = data[verseNumber];
                let verseElement = document.createElement('div');
                verseElement.classList.add('verse');
                verseElement.id = `verse-${verseNumber}`;
                verseElement.innerHTML = `<strong>${verseNumber}.</strong> ${verseText} <button class="play-btn" onclick="playVerse('${book}', '${chapter}', '${verseNumber}')">Play</button>`;
                bibleText.appendChild(verseElement);
            });

            // Automatically play the chapter when loaded
            if (autoPlay) {
                playVerse(book, chapter, currentVerse);
            }

            // Update "Next" and "Previous" button text based on the chapter
            updateButtonText(book, chapter);
        });
}

function updateButtonText(book, chapter) {
    fetch(`/api/${book}/chapters`)
        .then(response => response.json())
        .then(data => {
            const chapterCount = data.chapters;
            if (chapter < chapterCount) {
                document.getElementById('next-button').innerText = 'Next Chapter';
            } else {
                document.getElementById('next-button').innerText = 'Next Book';
            }

            if (chapter === 1) {
                const currentBookIndex = bookOrder.indexOf(book);
                if (currentBookIndex > 0) {
                    document.getElementById('prev-button').innerText = 'Previous Book';
                } else {
                    document.getElementById('prev-button').style.display = 'none'; // No previous for Genesis
                }
            } else {
                document.getElementById('prev-button').innerText = 'Previous Chapter';
                document.getElementById('prev-button').style.display = 'block';
            }
        });
}

function playVerse(book, chapter, verse) {
    let audioUrl = `/Bible_Audio/${book}/Chapter_${chapter}/Verse_${verse}.mp3`;
    audioPlayer.src = audioUrl;
    audioPlayer.play();

    highlightVerse(verse);

    audioPlayer.onended = function () {
        let nextVerse = parseInt(verse) + 1;
        let nextVerseElement = document.getElementById(`verse-${nextVerse}`);
        if (nextVerseElement) {
            playVerse(book, chapter, nextVerse);
        } else {
            // If no next verse, check if there's another chapter
            fetch(`/api/${book}/chapters`)
                .then(response => response.json())
                .then(data => {
                    const chapterCount = data.chapters;
                    if (chapter < chapterCount) {
                        currentChapter++;
                        loadChapter(currentBook, currentChapter);
                    } else {
                        moveToNextBook();
                    }
                });
        }
    };
}

function moveToNextBook() {
    const currentBookIndex = bookOrder.indexOf(currentBook);
    if (currentBookIndex !== -1 && currentBookIndex < bookOrder.length - 1) {
        currentBook = bookOrder[currentBookIndex + 1];
        currentChapter = 1;  // Start at the first chapter of the next book
        loadChapter(currentBook, currentChapter);
    }
}

function moveToPreviousBook() {
    const currentBookIndex = bookOrder.indexOf(currentBook);
    if (currentBookIndex > 0) {
        currentBook = bookOrder[currentBookIndex - 1];
        fetch(`/api/${currentBook}/chapters`)
            .then(response => response.json())
            .then(data => {
                const chapterCount = data.chapters;
                currentChapter = chapterCount;  // Move to the last chapter of the previous book
                loadChapter(currentBook, currentChapter);
            });
    }
}

function highlightVerse(verse) {
    document.querySelectorAll('.verse').forEach(verseElement => {
        verseElement.classList.remove('highlight');
    });
    let currentVerseElement = document.getElementById(`verse-${verse}`);
    if (currentVerseElement) {
        currentVerseElement.classList.add('highlight');
    }
}

// Search suggestions based on input, showing only matching books and then chapters
function searchSuggestions() {
    const query = document.getElementById('search-box').value.toLowerCase();
    const suggestions = document.getElementById('suggestions');
    suggestions.innerHTML = '';

    // Check if input is a full book name or partial name
    let matchingBooks = bookOrder.filter(abbr => {
        const fullName = bookNames[abbr].toLowerCase();
        return fullName.startsWith(query) || abbr.toLowerCase().startsWith(query);
    });

    if (matchingBooks.length === 1 && query === bookNames[matchingBooks[0]].toLowerCase()) {
        // Full book name matched, show chapters
        const book = matchingBooks[0];
        fetch(`/api/${book}/chapters`)
            .then(response => response.json())
            .then(data => {
                const chapterCount = data.chapters;
                for (let i = 1; i <= chapterCount; i++) {
                    const suggestionItem = document.createElement('div');
                    suggestionItem.classList.add('suggestion-item');
                    suggestionItem.textContent = `${bookNames[book]} ${i}`;
                    suggestionItem.onclick = function () {
                        window.location.href = `/?book=${book}&chapter=${i}`;
                    };
                    suggestions.appendChild(suggestionItem);
                }
            });
    } else {
        // Show only books that match the query
        matchingBooks.forEach(abbr => {
            const fullName = bookNames[abbr];
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = fullName;
            suggestionItem.onclick = function () {
                document.getElementById('search-box').value = fullName;  // Set the input
                window.location.href = `/?book=${abbr}&chapter=1`;  // Redirect to the first chapter
            };
            suggestions.appendChild(suggestionItem);
        });
    }
}

// Utility function to get query parameters
function getQueryParam(param, defaultValue) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param) || defaultValue;
}
