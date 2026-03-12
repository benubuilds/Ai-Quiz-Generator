import { motion } from 'motion/react';
import { CheckCircle2, XCircle, RefreshCw, Download, Copy, Share2, Award } from 'lucide-react';
import { Quiz } from '../types';

interface ResultsProps {
  quiz: Quiz;
  userAnswers: Record<number, string>;
  onRestart: () => void;
}

export function Results({ quiz, userAnswers, onRestart }: ResultsProps) {
  const score = quiz.questions.reduce((acc, q, idx) => {
    return acc + (userAnswers[idx] === q.correctAnswer ? 1 : 0);
  }, 0);

  const percentage = Math.round((score / quiz.questions.length) * 100);

  const handleCopy = () => {
    let text = `${quiz.title}\n\n`;
    quiz.questions.forEach((q, i) => {
      text += `Q${i + 1}: ${q.question}\n`;
      q.options.forEach((opt, j) => {
        text += `  ${String.fromCharCode(65 + j)}. ${opt}\n`;
      });
      text += `Answer: ${q.correctAnswer}\n`;
      text += `Explanation: ${q.explanation}\n\n`;
    });
    navigator.clipboard.writeText(text);
    alert('Quiz copied to clipboard!');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: quiz.title,
          text: `I scored ${score}/${quiz.questions.length} on the "${quiz.title}" quiz!`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      handleCopy();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-3xl mx-auto pb-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 text-center mb-8"
      >
        <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <Award className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold mb-2">Quiz Complete!</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">You scored {score} out of {quiz.questions.length}</p>
        
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">
            {percentage}%
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={onRestart}
            className="px-6 py-3 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-md hover:shadow-indigo-500/25 active:scale-95"
          >
            <RefreshCw className="w-5 h-5" />
            Create New Quiz
          </button>
          
          <button
            onClick={handleCopy}
            className="px-6 py-3 rounded-xl font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
          >
            <Copy className="w-5 h-5" />
            Copy
          </button>

          <button
            onClick={handlePrint}
            className="px-6 py-3 rounded-xl font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            PDF
          </button>

          <button
            onClick={handleShare}
            className="px-6 py-3 rounded-xl font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            Share
          </button>
        </div>
      </motion.div>

      <div className="space-y-6 print:space-y-4">
        <h3 className="text-xl font-bold mb-4 px-2">Detailed Results</h3>
        {quiz.questions.map((q, idx) => {
          const userAnswer = userAnswers[idx];
          const isCorrect = userAnswer === q.correctAnswer;

          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={idx}
              className={`bg-white dark:bg-slate-900 rounded-2xl shadow-sm border p-6 ${
                isCorrect ? 'border-emerald-200 dark:border-emerald-900/30' : 'border-red-200 dark:border-red-900/30'
              }`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`mt-1 shrink-0 ${isCorrect ? 'text-emerald-500' : 'text-red-500'}`}>
                  {isCorrect ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                </div>
                <div>
                  <h4 className="font-semibold text-lg leading-snug mb-2">
                    {idx + 1}. {q.question}
                  </h4>
                  <div className="space-y-2 mb-4">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = userAnswer === opt;
                      const isActuallyCorrect = q.correctAnswer === opt;
                      
                      let bgClass = 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800';
                      if (isActuallyCorrect) {
                        bgClass = 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50 font-medium';
                      } else if (isSelected && !isCorrect) {
                        bgClass = 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/50 line-through opacity-70';
                      }

                      return (
                        <div key={optIdx} className={`px-4 py-3 rounded-xl border ${bgClass} flex items-center justify-between`}>
                          <span>{opt}</span>
                          {isActuallyCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                          {isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-500" />}
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-xl p-4 border border-indigo-100 dark:border-indigo-900/30">
                    <p className="text-sm font-medium text-indigo-800 dark:text-indigo-300 mb-1">Explanation:</p>
                    <p className="text-sm text-indigo-700/80 dark:text-indigo-300/80 leading-relaxed">
                      {q.explanation}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
