/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RotateCcw, Send, HelpCircle, ChevronRight, Share2, Check } from 'lucide-react';

export default function App() {
  const [targetNumber, setTargetNumber] = useState<number>(0);
  const [guess, setGuess] = useState<string>('');
  const [message, setMessage] = useState<string>('I\'m thinking of a number between 1 and 100...');
  const [attempts, setAttempts] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [history, setHistory] = useState<{ guess: number; result: 'high' | 'low' | 'correct' }[]>([]);
  const [shake, setShake] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    setTargetNumber(Math.floor(Math.random() * 100) + 1);
    setGuess('');
    setMessage('I\'m thinking of a number between 1 and 100...');
    setAttempts(0);
    setIsGameOver(false);
    setHistory([]);
    // Delay focus to ensure keyboard doesn't pop up immediately on load for all devices
    setTimeout(() => {
      if (window.innerWidth > 768) inputRef.current?.focus();
    }, 500);
  };

  const handleGuess = (e?: FormEvent) => {
    e?.preventDefault();
    
    const numGuess = parseInt(guess);
    
    if (isNaN(numGuess) || numGuess < 1 || numGuess > 100) {
      setMessage('Please enter a valid number between 1 and 100.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    let result: 'high' | 'low' | 'correct';
    if (numGuess === targetNumber) {
      setMessage(`Correct! You found it in ${newAttempts} attempts!`);
      setIsGameOver(true);
      result = 'correct';
    } else if (numGuess < targetNumber) {
      setMessage('Too low! Try a higher number.');
      result = 'low';
    } else {
      setMessage('Too high! Try a lower number.');
      result = 'high';
    }

    setHistory([{ guess: numGuess, result }, ...history]);
    setGuess('');
    inputRef.current?.focus();
  };

  const handleShare = async () => {
    if (isSharing) return;
    
    const shareUrl = window.location.href;
    if (navigator.share) {
      setIsSharing(true);
      try {
        await navigator.share({
          title: 'Number Guessing Pro',
          text: 'Can you beat my score in this number guessing game?',
          url: shareUrl,
        });
      } catch (err) {
        // Only log if it's not a user cancellation
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      } finally {
        setIsSharing(false);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Error copying to clipboard:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-orange-500/30 flex flex-col">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-orange-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 flex-grow max-w-2xl mx-auto w-full px-4 py-8 md:py-16 flex flex-col items-center">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 md:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] md:text-xs font-mono tracking-widest uppercase text-orange-400 mb-4">
            <HelpCircle size={14} />
            Cross-Platform Challenge
          </div>
          <h1 className="text-4xl md:text-7xl font-bold tracking-tighter mb-4 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
            Guess the Number
          </h1>
          <p className="text-white/40 text-sm md:text-lg max-w-md mx-auto leading-relaxed px-4">
            Play on any device. Can you find the secret number in the fewest tries?
          </p>
        </motion.div>

        {/* Game Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="w-full bg-white/[0.03] border border-white/10 rounded-3xl p-6 md:p-12 backdrop-blur-xl shadow-2xl relative overflow-hidden"
        >
          {/* Status Message */}
          <div className="mb-6 md:mb-8 text-center min-h-[3rem] flex items-center justify-center px-2">
            <AnimatePresence mode="wait">
              <motion.p 
                key={message}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`text-lg md:text-xl font-medium ${isGameOver ? 'text-green-400' : 'text-white/80'}`}
              >
                {message}
              </motion.p>
            </AnimatePresence>
          </div>

          {!isGameOver ? (
            <form onSubmit={handleGuess} className="space-y-4 md:space-y-6">
              <motion.div 
                animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
                className="relative"
              >
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="1-100"
                  className="w-full bg-white/5 border-2 border-white/10 rounded-2xl px-6 py-4 md:py-5 text-3xl md:text-4xl font-bold text-center focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-white/10"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none hidden md:block">
                  <ChevronRight size={32} />
                </div>
              </motion.div>

              <button
                type="submit"
                className="w-full bg-white text-black font-bold py-4 md:py-5 rounded-2xl flex items-center justify-center gap-2 hover:bg-orange-500 hover:text-white transition-all active:scale-[0.98] group touch-manipulation"
              >
                Submit Guess
                <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </form>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4 md:gap-6"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 mb-2">
                <Trophy size={40} className="md:size-12" />
              </div>
              <div className="text-center">
                <p className="text-white/40 uppercase tracking-widest text-[10px] font-bold mb-1">Secret Number</p>
                <p className="text-6xl md:text-8xl font-black text-white leading-none">{targetNumber}</p>
              </div>
              <button
                onClick={startNewGame}
                className="mt-2 px-8 py-4 bg-white text-black font-bold rounded-2xl flex items-center gap-2 hover:bg-green-500 hover:text-white transition-all active:scale-[0.98] touch-manipulation"
              >
                <RotateCcw size={20} />
                Play Again
              </button>
            </motion.div>
          )}

          {/* Stats Footer */}
          <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-white/5 flex justify-between items-center text-[10px] md:text-sm font-mono text-white/40">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              Attempts: <span className="text-white font-bold">{attempts}</span>
            </div>
            <button 
              onClick={handleShare}
              disabled={isSharing}
              className={`flex items-center gap-2 hover:text-white transition-colors ${isSharing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {copied ? <Check size={14} className="text-green-400" /> : <Share2 size={14} />}
              {copied ? 'Copied!' : isSharing ? 'Sharing...' : 'Share Game'}
            </button>
          </div>
        </motion.div>

        {/* History Section */}
        {history.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full mt-8 md:mt-12"
          >
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 mb-4 md:mb-6 text-center">Guess History</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 md:gap-3">
              <AnimatePresence initial={false}>
                {history.map((item, index) => (
                  <motion.div
                    key={history.length - index}
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`p-3 md:p-4 rounded-xl md:rounded-2xl border flex flex-col items-center justify-center gap-1 ${
                      item.result === 'correct' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                      item.result === 'high' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                      'bg-blue-500/10 border-blue-500/20 text-blue-400'
                    }`}
                  >
                    <span className="text-xl md:text-2xl font-black">{item.guess}</span>
                    <span className="text-[8px] md:text-[10px] uppercase font-bold opacity-60 text-center">
                      {item.result === 'correct' ? 'Bingo' : item.result === 'high' ? 'Too High' : 'Too Low'}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="relative z-10 w-full py-8 text-center text-white/20 text-[10px] flex flex-col items-center gap-4">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span>Lower</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
            <span>Higher</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span>Correct</span>
          </div>
        </div>
        <p>© 2026 Number Guessing Pro • Optimized for All Devices</p>
      </footer>
    </div>
  );
}
