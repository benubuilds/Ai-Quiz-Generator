import { motion } from 'motion/react';
import { Sparkles, ArrowRight, FileText, Brain, Zap } from 'lucide-react';

interface HomeProps {
  onStart: () => void;
}

export function Home({ onStart }: HomeProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center max-w-3xl mx-auto py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium"
      >
        <Sparkles className="w-4 h-4" />
        <span>Powered by Google Gemini</span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6"
      >
        Turn any content into an <br className="hidden md:block" />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">
          interactive quiz
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl"
      >
        Paste text, enter a topic, or upload a document. Our AI instantly generates a custom quiz to test your knowledge.
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        onClick={onStart}
        className="group flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95"
      >
        Get Started
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full"
      >
        {[
          { icon: Brain, title: 'Any Topic', desc: 'Just type what you want to learn about.' },
          { icon: FileText, title: 'From Text', desc: 'Paste your notes or articles directly.' },
          { icon: Zap, title: 'Instant Results', desc: 'Get your quiz in seconds, ready to play.' },
        ].map((feature, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
              <feature.icon className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{feature.desc}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
