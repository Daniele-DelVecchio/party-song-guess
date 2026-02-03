# Architecture Documentation

## Overview

Party Song Guess is a real-time multiplayer browser game where players guess the song title from a 30-second preview.

## Components

### Server (Node.js)

- **Framework**: Express + Socket.io
- **State Management**: In-memory (Variables `rooms` in `index.js`).
- **Music Service**: Fetches metadata and previews from iTunes Search API.
- **Game Logic**:
  - `RoomManager`: Handles room creation/joining (inline in index.js for now).
  - `GameLoop`: Manages rounds, timeouts (30s), and scoring.

### Client (React)

- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Communication**: `socket.io-client`
- **Audio**: HTML5 `Audio` object controlled programmatically.

## Events Flow

1. **Lobby**: `create_room` -> `room_created` -> User shares ID.
2. **Game Start**: Owner clicks start -> `start_game` -> Server fetches songs -> `game_started`.
3. **Round Loop**:
    - Server: `new_round` (sends previewUrl).
    - Client: Plays audio.
    - Client: User types guess -> `submit_guess`.
    - Server: Validates guess.
        - Correct: `round_winner` -> `update_scores` -> Wait 5s -> Next Round.
        - Default: Wait 30s -> `round_timeout` -> Wait 5s -> Next Round.
4. **Game Over**: Server emits `game_over` -> Client shows final scores.

## Future Improvements

- Persistent Database (SQLite/Postgres).
- Better Fuzzy Matching (Levenshtein distance).
- OAuth with Spotify for full tracks.
