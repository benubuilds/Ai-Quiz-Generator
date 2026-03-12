import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { FileText, Type, Upload, Loader2, AlertCircle, Globe, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { QuizSettings, Difficulty, QuestionType } from '../types';
import * as mammoth from 'mammoth';

interface GeneratorProps {
  onGenerate: (settings: QuizSettings) => void;
  isGenerating: boolean;
  error: string | null;
}

const LANGUAGES = [
  'Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Urdu', 'Gujarati', 
  'Kannada', 'Odia', 'Malayalam', 'Punjabi', 'Assamese', 'Maithili', 
  'Sanskrit', 'Santali', 'Kashmiri', 'Sindhi', 'Konkani', 'Dogri', 
  'Bodo', 'Manipuri', 'Nepali'
];

export function Generator({ onGenerate, isGenerating, error }: GeneratorProps) {
  const [inputType, setInputType] = useState<'topic' | 'text' | 'link' | 'file' | 'image'>('topic');
  const [topic, setTopic] = useState('');
  const [text, setText] = useState('');
  const [link, setLink] = useState('');
  
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileProgress, setFileProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageProgress, setImageProgress] = useState(0);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [questionCount, setQuestionCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [questionType, setQuestionType] = useState<QuestionType>('Multiple Choice');
  const [language, setLanguage] = useState<string>('Hindi');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 10 * 1024 * 1024) {
        setFileError('File size must be less than 10MB');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setFileProgress(0);
      const interval = setInterval(() => {
        setFileProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 20;
        });
      }, 100);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(null);
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 10 * 1024 * 1024) {
        setImageError('Image size must be less than 10MB');
        setImageFile(null);
        return;
      }
      setImageFile(selectedFile);
      setImageProgress(0);
      const interval = setInterval(() => {
        setImageProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 20;
        });
      }, 100);
    }
  };

  const handleGenerate = async () => {
    if (inputType === 'topic' && !topic.trim()) return;
    if (inputType === 'text' && !text.trim()) return;
    if (inputType === 'link' && !link.trim()) return;
    if (inputType === 'file' && !file) return;
    if (inputType === 'image' && !imageFile) return;

    let fileData;
    let imageData;
    let extractedText;

    if (inputType === 'file' && file) {
      if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          extractedText = result.value;
        } catch (err) {
          console.error('Error parsing DOCX:', err);
          setFileError('Failed to parse the Word document. Please try a PDF or text file.');
          return;
        }
      } else {
        const reader = new FileReader();
        fileData = await new Promise((resolve) => {
          reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1];
            resolve({
              data: base64String,
              mimeType: file.type || 'application/octet-stream',
              name: file.name,
            });
          };
          reader.readAsDataURL(file);
        });
      }
    }

    if (inputType === 'image' && imageFile) {
      const reader = new FileReader();
      imageData = await new Promise((resolve) => {
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1];
          resolve({
            data: base64String,
            mimeType: imageFile.type || 'image/jpeg',
            name: imageFile.name,
          });
        };
        reader.readAsDataURL(imageFile);
      });
    }

    onGenerate({
      topic: inputType === 'topic' ? topic : undefined,
      text: inputType === 'text' ? text : (extractedText || undefined),
      link: inputType === 'link' ? link : undefined,
      file: fileData as any,
      image: imageData as any,
      questionCount,
      difficulty,
      questionType,
      language,
    });
  };

  const isReady = () => {
    if (inputType === 'topic') return topic.trim().length > 0;
    if (inputType === 'text') return text.trim().length > 0;
    if (inputType === 'link') return link.trim().length > 0;
    if (inputType === 'file') return file !== null && fileProgress === 100;
    if (inputType === 'image') return imageFile !== null && imageProgress === 100;
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

      {(error || fileError || imageError) && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-start gap-3 border border-red-200 dark:border-red-800/30">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <p className="text-sm">{error || fileError || imageError}</p>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8">
        <div className="flex p-1.5 space-x-1 bg-slate-100 dark:bg-slate-800/50 rounded-2xl mb-8 overflow-x-auto hide-scrollbar">
          {[
            { id: 'topic', label: 'Topic', icon: Type },
            { id: 'text', label: 'Text', icon: FileText },
            { id: 'link', label: 'Link', icon: LinkIcon },
            { id: 'file', label: 'Document', icon: Upload },
            { id: 'image', label: 'Image', icon: ImageIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setInputType(tab.id as any)}
              className={`flex-1 min-w-[100px] py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium text-sm transition-all whitespace-nowrap ${
                inputType === tab.id
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div>
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

          {inputType === 'link' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Paste an article link</label>
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://example.com/article"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
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
                <div className="text-center w-full max-w-xs">
                  <p className="font-medium text-slate-700 dark:text-slate-300 truncate">
                    {file ? file.name : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    PDF, DOCX, TXT (Max 10MB)
                  </p>
                  
                  {fileProgress > 0 && (
                    <div className="w-full mt-4">
                      <div className="flex justify-between text-xs mb-1 text-slate-500">
                        <span>{fileProgress < 100 ? 'Uploading...' : 'Upload complete'}</span>
                        <span>{fileProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                        <div className="bg-indigo-600 h-1.5 rounded-full transition-all duration-200" style={{ width: `${fileProgress}%` }}></div>
                      </div>
                    </div>
                  )}
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

          {inputType === 'image' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Upload an image</label>
              <div 
                onClick={() => imageInputRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div className="text-center w-full max-w-xs">
                  <p className="font-medium text-slate-700 dark:text-slate-300 truncate">
                    {imageFile ? imageFile.name : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    JPG, JPEG, PNG, WEBP (Max 10MB)
                  </p>
                  
                  {imageProgress > 0 && (
                    <div className="w-full mt-4">
                      <div className="flex justify-between text-xs mb-1 text-slate-500">
                        <span>{imageProgress < 100 ? 'Uploading...' : 'Upload complete'}</span>
                        <span>{imageProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                        <div className="bg-indigo-600 h-1.5 rounded-full transition-all duration-200" style={{ width: `${imageProgress}%` }}></div>
                      </div>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={handleImageChange}
                  accept=".jpg,.jpeg,.png,.webp"
                  className="hidden"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Questions</label>
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
            <option value="Multiple Choice">Multiple Choice</option>
            <option value="True / False">True / False</option>
            <option value="Mixed">Mixed</option>
          </select>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
            Language
          </label>
          <div className="relative">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm font-medium appearance-none"
            >
              {LANGUAGES.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
            <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
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
