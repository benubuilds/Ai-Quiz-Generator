/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Home } from './components/Home';
import { Generator } from './components/Generator';
import { QuizPlayer } from './components/QuizPlayer';
import { Results } from './components/Results';
import { PrintableQuiz } from './components/PrintableQuiz';
import { Quiz, QuizSettings } from './types';
import { generateQuiz } from './services/gemini';
import { Moon, Sun, BrainCircuit } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<'home' | 'generator' | 'playing' | 'results'>('home');
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);

  const toggleDark = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const handleGenerate = async (settings: QuizSettings) => {
    setIsGenerating(true);
    setError(null);
    try {
      const newQuiz = await generateQuiz(settings);
      setQuiz(newQuiz);
      setUserAnswers({});
      setView('playing');
    } catch (err: any) {
      setError(err.message || 'Failed to generate quiz. Please try again.');
    } finally {
      setIsGenerating(false);
    }
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
      <div className="print:hidden min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex flex-col font-sans transition-colors duration-200">
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
      </div>
      {quiz && <PrintableQuiz quiz={quiz} />}
    </>
  );
}
