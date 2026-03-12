import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, CheckCircle2, Download } from 'lucide-react';
import { Quiz } from '../types';
import { ExportModal } from './ExportModal';

interface QuizPlayerProps {
  quiz: Quiz;
  onFinish: (answers: Record<number, string>) => void;
}

export function QuizPlayer({ quiz, onFinish }: QuizPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isExportOpen, setIsExportOpen] = useState(false);

  const question = quiz.questions[currentIndex];
  const isLast = currentIndex === quiz.questions.length - 1;
  const progress = ((currentIndex + 1) / quiz.questions.length) * 100;

  const handleSelect = (option: string) => {
    setAnswers((prev) => ({ ...prev, [currentIndex]: option }));
  };

  const handleNext = () => {
    if (isLast) {
      onFinish(answers);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col h-full">
      <ExportModal quiz={quiz} isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
      
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4 gap-4">
          <div className="w-10"></div> {/* Spacer for centering */}
          <h2 className="text-2xl font-bold text-center flex-1">{quiz.title}</h2>
          <button 
            onClick={() => setIsExportOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Export Quiz"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center justify-between text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
          <span>Question {currentIndex + 1} of {quiz.questions.length}</span>
          <span>{Math.round(progress)}% Completed</span>
        </div>
        <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-indigo-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8"
          >
            <h3 className="text-xl font-semibold mb-6 leading-relaxed">
              {question.question}
            </h3>

            <div className="space-y-3">
              {question.options.map((option, idx) => {
                const isSelected = answers[currentIndex] === option;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(option)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-100'
                        : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <span className="font-medium">{option}</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 dark:border-slate-600 group-hover:border-indigo-400'
                    }`}>
                      {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-8 flex items-center justify-between gap-4">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="px-6 py-3 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <ChevronLeft className="w-5 h-5" />
          Previous
        </button>
        
        <button
          onClick={handleNext}
          disabled={!answers[currentIndex]}
          className="px-8 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 transition-all flex items-center gap-2 shadow-md hover:shadow-indigo-500/25 active:scale-95 disabled:active:scale-100 disabled:shadow-none"
        >
          {isLast ? (
            <>
              Submit Quiz
              <CheckCircle2 className="w-5 h-5" />
            </>
          ) : (
            <>
              Next
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
