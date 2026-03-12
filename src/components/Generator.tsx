import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { FileText, Type, Upload, Loader2, AlertCircle } from 'lucide-react';
import { QuizSettings, Difficulty, QuestionType } from '../types';

interface GeneratorProps {
  onGenerate: (settings: QuizSettings) => void;
  isGenerating: boolean;
  error: string | null;
}

export function Generator({ onGenerate, isGenerating, error }: GeneratorProps) {
  const [inputType, setInputType] = useState<'topic' | 'text' | 'file'>('topic');
  const [topic, setTopic] = useState('');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [questionCount, setQuestionCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [questionType, setQuestionType] = useState<QuestionType>('Multiple Choice');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleGenerate = async () => {
    if (inputType === 'topic' && !topic.trim()) return;
    if (inputType === 'text' && !text.trim()) return;
    if (inputType === 'file' && !file) return;

    let fileData;
    if (inputType === 'file' && file) {
      const reader = new FileReader();
      fileData = await new Promise((resolve) => {
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1];
          resolve({
            data: base64String,
            mimeType: file.type,
            name: file.name,
          });
        };
        reader.readAsDataURL(file);
      });
    }

    onGenerate({
      topic: inputType === 'topic' ? topic : undefined,
      text: inputType === 'text' ? text : undefined,
      file: inputType === 'file' ? fileData as any : undefined,
      questionCount,
      difficulty,
      questionType,
    });
  };

  const isReady = () => {
    if (inputType === 'topic') return topic.trim().length > 0;
    if (inputType === 'text') return text.trim().length > 0;
    if (inputType === 'file') return file !== null;
    return false;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-3xl mx-auto flex flex-col gap-8"
    >
      <div className="text-center mb-4">
        <h2 className="text-3xl font-bold mb-2">Create your Quiz</h2>
        <p className="text-slate-500 dark:text-slate-400">Choose your source material and customize the settings.</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-start gap-3 border border-red-200 dark:border-red-800/30">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          {[
            { id: 'topic', label: 'Topic', icon: Type },
            { id: 'text', label: 'Text', icon: FileText },
            { id: 'file', label: 'PDF / Doc', icon: Upload },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setInputType(tab.id as any)}
              className={`flex-1 py-4 px-6 flex items-center justify-center gap-2 font-medium text-sm transition-colors ${
                inputType === tab.id
                  ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 md:p-8">
          {inputType === 'topic' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">What do you want to learn about?</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Artificial Intelligence, World War II, JavaScript Basics"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          )}

          {inputType === 'text' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Paste your text here</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste articles, notes, or any text content..."
                rows={6}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
              />
            </div>
          )}

          {inputType === 'file' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Upload a document</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-slate-700 dark:text-slate-300">
                    {file ? file.name : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    PDF, TXT, DOCX (Max 5MB)
                  </p>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.txt,.doc,.docx"
                  className="hidden"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Number of Questions</label>
          <div className="flex gap-2">
            {[5, 10, 15, 20].map((num) => (
              <button
                key={num}
                onClick={() => setQuestionCount(num)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  questionCount === num
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Difficulty</label>
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            {['Easy', 'Medium', 'Hard'].map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficulty(diff as Difficulty)}
                className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${
                  difficulty === diff
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Question Type</label>
          <select
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value as QuestionType)}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm font-medium appearance-none"
          >
            <option value="Multiple Choice">Multiple Choice (MCQ)</option>
            <option value="True / False">True / False</option>
            <option value="Mixed">Mixed</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={!isReady() || isGenerating}
        className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 dark:disabled:text-slate-500 text-white font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98] disabled:active:scale-100 disabled:shadow-none"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating Quiz...
          </>
        ) : (
          'Generate Quiz'
        )}
      </button>
    </motion.div>
  );
}
