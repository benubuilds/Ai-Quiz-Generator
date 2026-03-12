import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Download, Share2, CheckCircle2, Twitter, Mail, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { Quiz } from '../types';

interface ExportModalProps {
  quiz: Quiz;
  isOpen: boolean;
  onClose: () => void;
}

export function ExportModal({ quiz, isOpen, onClose }: ExportModalProps) {
  const [copied, setCopied] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    let text = `${quiz.title}\n\n`;
    quiz.questions.forEach((q, i) => {
      text += `${i + 1}. ${q.question}\n`;
      q.options.forEach((opt, j) => {
        text += `   ${String.fromCharCode(65 + j)}. ${opt}\n`;
      });
      text += '\n';
    });
    text += '--- Answer Key ---\n';
    quiz.questions.forEach((q, i) => {
      text += `${i + 1}. ${q.correctAnswer}\n`;
      text += `Explanation: ${q.explanation}\n\n`;
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    window.print();
    onClose();
  };

  const shareUrl = window.location.href;
  const shareText = `Check out this quiz: ${quiz.title}`;

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
    email: `mailto:?subject=${encodeURIComponent(quiz.title)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm print:hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-bold">Export Quiz</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          <button
            onClick={handleDownloadPDF}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
              <Download className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-semibold">Download PDF</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Save as a printable document</div>
            </div>
          </button>

          <button
            onClick={handleCopy}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
              {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
            </div>
            <div className="text-left">
              <div className="font-semibold">{copied ? 'Copied!' : 'Copy to Clipboard'}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Copy text format with answers</div>
            </div>
          </button>

          <div className="pt-2">
            <button
              onClick={() => setShowShareOptions(!showShareOptions)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                <Share2 className="w-5 h-5" />
              </div>
              <div className="text-left flex-1">
                <div className="font-semibold">Share Quiz</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Share via social media or email</div>
              </div>
            </button>

            <AnimatePresence>
              {showShareOptions && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center justify-center gap-4 pt-4 pb-2">
                    <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-[#1DA1F2]/10 text-[#1DA1F2] hover:bg-[#1DA1F2]/20 transition-colors">
                      <Twitter className="w-5 h-5" />
                    </a>
                    <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors">
                      <MessageCircle className="w-5 h-5" />
                    </a>
                    <a href={shareLinks.email} className="p-3 rounded-full bg-slate-500/10 text-slate-600 dark:text-slate-300 hover:bg-slate-500/20 transition-colors">
                      <Mail className="w-5 h-5" />
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
