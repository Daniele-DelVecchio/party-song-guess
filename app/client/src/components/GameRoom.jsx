import React, { useEffect, useState, useRef } from 'react';

export default function GameRoom({ socket, room, players }) {
    const [currentRound, setCurrentRound] = useState(0);
    const [status, setStatus] = useState('Get Ready...'); // Get Ready, Playing, Round Over
    const [guess, setGuess] = useState('');
    const [roundResult, setRoundResult] = useState(null); // { winner: 'Name', song: {...} }
    const audioRef = useRef(new Audio());

    useEffect(() => {
        socket.on('new_round', ({ roundNumber, previewUrl }) => {
            setCurrentRound(roundNumber);
            setStatus('PLAYING');
            setRoundResult(null);
            setGuess('');

            // Play Audio
            audioRef.current.src = previewUrl;
            audioRef.current.volume = 0.5;
            audioRef.current.play().catch(e => console.error("Autoplay prevent?", e));
        });

        socket.on('round_winner', ({ player, song }) => {
            setStatus('ROUND_OVER');
            setRoundResult({ winner: player, song });
            audioRef.current.pause();
        });

        socket.on('round_timeout', ({ song }) => {
            setStatus('ROUND_OVER');
            setRoundResult({ winner: null, song }); // No winner
            audioRef.current.pause();
        });

        // Clean up listeners
        return () => {
            socket.off('new_round');
            socket.off('round_winner');
            socket.off('round_timeout');
            audioRef.current.pause();
        };
    }, [socket]);

    const submitGuess = (e) => {
        e.preventDefault();
        if (guess.trim()) {
            socket.emit('submit_guess', { roomId: room.id, guess });
            // Optionally clear guess or give feedback "Submitted"
        }
    };

    return (
        <div className="w-full max-w-2xl flex flex-col items-center">

            <div className="w-full flex justify-between items-center mb-6 px-4">
                <div className="bg-gray-800 px-4 py-2 rounded-full font-mono">
                    Round {currentRound} / 10
                </div>
                <div className="text-xl font-bold animate-pulse text-purple-400">
                    {status === 'PLAYING' ? '🎵 GUESS THE SONG 🎵' : status}
                </div>
            </div>

            {/* Visualizer / Album Art placeholder */}
            <div className="w-64 h-64 bg-gray-800 rounded-xl mb-8 flex items-center justify-center shadow-lg border-4 border-gray-700 relative overflow-hidden">
                {status === 'ROUND_OVER' && roundResult?.song?.artwork ? (
                    <img src={roundResult.song.artwork.replace('100x100', '400x400')} alt="Album Art" className="w-full h-full object-cover" />
                ) : (
                    <div className="text-6xl">❓</div>
                )}
            </div>

            {status === 'ROUND_OVER' && roundResult && (
                <div className="mb-6 text-center animate-bounce">
                    <h3 className="text-xl text-green-400 font-bold">
                        {roundResult.winner ? `${roundResult.winner} ha indovinato!` : 'Tempo Scaduto!'}
                    </h3>
                    <p className="text-lg">
                        {roundResult.song.title} - <span className="text-gray-400">{roundResult.song.artist}</span>
                    </p>
                </div>
            )}

            <form onSubmit={submitGuess} className="w-full flex gap-2">
                <input
                    type="text"
                    value={guess}
                    onChange={e => setGuess(e.target.value)}
                    placeholder="Titolo della canzone..."
                    disabled={status !== 'PLAYING'}
                    className="flex-1 p-4 rounded-lg bg-gray-800 border-2 border-gray-700 focus:border-purple-500 focus:outline-none text-lg"
                    autoFocus
                />
                <button
                    type="submit"
                    disabled={status !== 'PLAYING'}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-8 py-4 rounded-lg font-bold transition"
                >
                    INVIA
                </button>
            </form>

            <div className="mt-8 w-full">
                <h4 className="text-gray-400 mb-2 font-bold uppercase text-sm tracking-wider">Scoreboard</h4>
                <div className="flex flex-wrap gap-4">
                    {players.sort((a, b) => b.score - a.score).map(p => (
                        <div key={p.id} className="bg-gray-800 px-3 py-1 rounded flex items-center gap-2 border border-gray-700">
                            <div className="w-2 h-2 rounded-full bg-green-400"></div>
                            <span className="font-bold">{p.name}</span>
                            <span className="text-purple-400 font-mono">{p.score}</span>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
