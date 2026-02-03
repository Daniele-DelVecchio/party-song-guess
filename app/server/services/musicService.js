const axios = require('axios');

async function getRandomSongs(genre = 'pop', limit = 10) {
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

        const results = response.data.results;
        if (!results || results.length === 0) return [];

        // Shuffle and pick 'limit' songs
        const shuffled = results.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, limit);

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
