const axios = require('axios');

function detectLanguage(text) {
    if (!text) return null;
    const s = text.toLowerCase();
    const words = s.split(/\s+/).filter(Boolean);

    const scores = { it: 0, en: 0, es: 0 };

    const itHints = ['che', 'non', 'per', 'con', 'una', 'uno', 'una', 'di', 'nel', 'della', 'delle', 'degli', 'gli'];
    const esHints = ['que', 'para', 'con', 'una', 'uno', 'del', 'de', 'las', 'los', 'el'];
    const enHints = ['the', 'and', 'you', 'me', 'of', 'in', 'on', 'love'];

    for (const w of words) {
        if (itHints.includes(w)) scores.it += 1;
        if (esHints.includes(w)) scores.es += 1;
        if (enHints.includes(w)) scores.en += 1;
    }

    // Accent hints
    if (/[áéíóúñ]/.test(s)) scores.es += 1;
    if (/[àèéìòù]/.test(s)) scores.it += 1;

    const entries = Object.entries(scores);
    entries.sort((a, b) => b[1] - a[1]);
    const [bestLang, bestScore] = entries[0];
    if (bestScore <= 0) return null;
    return bestLang;
}

async function getRandomSongs(genre = 'pop', limit = 10, language = null, difficulty = 'hard') {
    try {
        // iTunes Search API
        // media=music, entity=song
        const response = await axios.get('https://itunes.apple.com/search', {
            params: {
                term: genre,
                media: 'music',
                entity: 'song',
                limit: 50 // Fetch more to randomize
            }
        });

        let results = response.data.results;
        if (!results || results.length === 0) return [];

        if (language) {
            results = results.filter(song => {
                const text = `${song.trackName || ''} ${song.artistName || ''} ${song.collectionName || ''}`;
                return detectLanguage(text) === language;
            });
            if (results.length === 0) {
                // Fallback: if filter removed everything, use original list
                results = response.data.results;
            }
        }

        let selected;
        if (difficulty === 'easy') {
            // Easier mode: keep API ordering (more popular / relevant first)
            // and just take the top 'limit' tracks
            selected = results.slice(0, limit);
        } else {
            // Hard mode (default): fully random within the result set
            const shuffled = results.sort(() => 0.5 - Math.random());
            selected = shuffled.slice(0, limit);
        }

        return selected.map(song => ({
            title: song.trackName,
            artist: song.artistName,
            previewUrl: song.previewUrl,
            artwork: song.artworkUrl100
        }));
    } catch (error) {
        console.error('Error fetching songs:', error.message);
        return [];
    }
}

module.exports = { getRandomSongs };
