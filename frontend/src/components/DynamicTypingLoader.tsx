import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

export default function DynamicTypingLoader() {
  const [text, setText] = useState('');
  const messages = [
    "Establishing backend API handshake...",
    "Waking up the free-tier database server (this takes ~45 seconds)...",
    "Almost there! Initializing cloud database connection...",
    "Fetching the latest job postings and recruiter updates...",
    "Preparing a customized, high-fidelity feed for you...",
    "Verifying authentication states and application trackers..."
  ];
  const [msgIndex, setMsgIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer: any;
    const currentMsg = messages[msgIndex];
    
    if (isDeleting) {
      timer = setTimeout(() => {
        setText(currentMsg.substring(0, charIndex - 1));
        setCharIndex(prev => prev - 1);
      }, 25);
    } else {
      timer = setTimeout(() => {
        setText(currentMsg.substring(0, charIndex + 1));
        setCharIndex(prev => prev + 1);
      }, 55);
    }

    if (!isDeleting && charIndex === currentMsg.length) {
      // Pause at full text
      timer = setTimeout(() => setIsDeleting(true), 2500);
    } else if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setMsgIndex(prev => (prev + 1) % messages.length);
    }

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, msgIndex]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[380px] text-center p-8 bg-white dark:bg-[#161b22] border border-gray-200/90 dark:border-gray-800 rounded-3xl shadow-sm max-w-7xl mx-auto my-6 transition-all duration-300">
      {/* Premium Loader Ring */}
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 rounded-full border-4 border-blue-50 dark:border-blue-900/20"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 dark:border-t-blue-400 animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-pulse" />
        </div>
      </div>
      
      <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2.5 tracking-tight">
        Connecting to JobberNaukari
      </h3>
      
      {/* Typing Text Box */}
      <div className="h-6 flex items-center justify-center px-4 max-w-md sm:max-w-xl">
        <p className="text-gray-600 dark:text-gray-300 font-bold text-xs sm:text-sm border-r-2 border-blue-600 dark:border-blue-400 pr-1 animate-caret whitespace-normal leading-relaxed">
          {text}
        </p>
      </div>
      
      {/* Friendly Note */}
      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl max-w-md border border-gray-100 dark:border-gray-800/80">
        <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
          <span className="font-extrabold text-blue-600 dark:text-blue-400">Pro-tip:</span> Our backend runs on a free tier. If the app hasn't been accessed recently, the server will go to sleep. Waking it up takes a few seconds on first load, but subsequent pages will load instantly!
        </p>
      </div>
    </div>
  );
}
