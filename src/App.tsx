/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Home } from './components/Home';
import { Generator } from './components/Generator';
import { QuizPlayer } from './components/QuizPlayer';
import { Results } from './components/Results';
import { PrintableQuiz } from './components/PrintableQuiz';
import { Quiz, QuizSettings } from './types';
import { generateQuiz } from './services/gemini';
import { Moon, Sun, BrainCircuit, Loader2, Timer, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [view, setView] = useState<'home' | 'generator' | 'playing' | 'results'>('home');
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      setTimeLeft(30);
      interval = setInterval(() => {
        setTimeLeft((prev) => (prev > 1 ? prev - 1 : 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const toggleDark = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleGenerate = async (settings: QuizSettings) => {
    setIsGenerating(true);
    setError(null);
    
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const newQuiz = await generateQuiz(settings);
      if (!abortController.signal.aborted) {
        setQuiz(newQuiz);
        setUserAnswers({});
        setView('playing');
      }
    } catch (err: any) {
      if (!abortController.signal.aborted) {
        setError(err.message || 'Failed to generate quiz. Please try again.');
      }
    } finally {
      if (!abortController.signal.aborted) {
        setIsGenerating(false);
      }
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsGenerating(false);
  };

  const handleFinishQuiz = (answers: Record<number, string>) => {
    setUserAnswers(answers);
    setView('results');
  };

  const reset = () => {
    setQuiz(null);
    setUserAnswers({});
    setView('home');
  };

  return (
    <>
      <div className="print:hidden min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex flex-col font-sans transition-colors duration-200 relative">
        <header className="p-4 md:p-6 flex justify-between items-center max-w-5xl w-full mx-auto">
          <div className="flex items-center gap-2 cursor-pointer" onClick={reset}>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h1 className="font-bold text-xl tracking-tight">AI Quiz Generator</h1>
          </div>
          <button 
            onClick={toggleDark}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </header>

        <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-6 flex flex-col">
          {view === 'home' && <Home onStart={() => setView('generator')} />}
          {view === 'generator' && (
            <Generator 
              onGenerate={handleGenerate} 
              isGenerating={isGenerating} 
              error={error} 
            />
          )}
          {view === 'playing' && quiz && (
            <QuizPlayer 
              quiz={quiz} 
              onFinish={handleFinishQuiz} 
            />
          )}
          {view === 'results' && quiz && (
            <Results 
              quiz={quiz} 
              userAnswers={userAnswers} 
              onRestart={reset} 
            />
          )}
        </main>

        <footer className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>Created by BenuBuilds</p>
        </footer>

        <AnimatePresence>
          {isGenerating && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm"
            >
              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4 max-w-sm w-full mx-4 border border-slate-200 dark:border-slate-800 relative">
                <button 
                  onClick={handleCancel}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                  title="Cancel Generation"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="relative mt-2">
                  <Loader2 className="w-16 h-16 text-indigo-600 dark:text-indigo-400 animate-spin" />
                </div>
                
                <h3 className="text-xl font-bold text-center mt-2">Generating your Quiz...</h3>
                
                <div className="flex flex-col items-center gap-3 w-full mt-2">
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-full font-mono font-medium">
                    <Timer className="w-4 h-4" />
                    0:{timeLeft.toString().padStart(2, '0')} remaining
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-1000 ease-linear" 
                      style={{ width: `${((30 - timeLeft) / 30) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-2">
                  This might take a moment depending on the size of your input. We are analyzing the content and crafting questions.
                </p>
                
                <button
                  onClick={handleCancel}
                  className="mt-2 w-full py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {quiz && <PrintableQuiz quiz={quiz} />}
    </>
  );
}
