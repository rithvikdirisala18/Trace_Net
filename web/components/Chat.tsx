"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Chat() {
  const [url, setUrl] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [ingesting, setIngesting] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [isUrlProcessed, setIsUrlProcessed] = useState(false);

  async function ingestWebsite() {
    if (!url) return;
    
    setIngesting(true);
    try {
      const res = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      
      const json = await res.json();
      if (json.success) {
        setIsUrlProcessed(true);
      } else {
        setAnswer("Failed to process the website. " + (json.error || ""));
      }
    } catch (error) {
      setAnswer("An error occurred while processing the website.");
    } finally {
      setIngesting(false);
    }
  }

  async function ask() {
    if (!question || !isUrlProcessed) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, url }),
      });
      
      const json = await res.json();
      setAnswer(json.answer || JSON.stringify(json));
    } catch (error) {
      setAnswer("An error occurred while processing your request.");
    } finally {
      setLoading(false);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isUrlProcessed) {
        ingestWebsite();
      } else {
        ask();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-700/50"
      >
        <motion.h1 
          className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          TraceNet
        </motion.h1>
        
        {!isUrlProcessed ? (
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Enter a website URL to analyze
            </label>
            <div className={`relative transition-all duration-300 ${inputFocused ? 'ring-2 ring-purple-500' : ''}`}>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                onKeyDown={handleKeyDown}
                placeholder="https://example.com"
                className="w-full p-3 bg-gray-700/50 rounded-lg border border-gray-600 focus:outline-none"
                disabled={ingesting}
              />
              <button
                onClick={ingestWebsite}
                disabled={ingesting || !url}
                className="absolute right-2 top-2 px-4 py-1 bg-purple-600 hover:bg-purple-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {ingesting ? 'Processing...' : 'Process'}
              </button>
            </div>
            {ingesting && (
              <div className="mt-4 text-sm text-gray-400">
                <div className="flex items-center">
                  <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-purple-500 border-r-2 rounded-full"></div>
                  <span>Loading and processing website content. This may take a minute...</span>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center mb-4">
              <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-green-400">Website processed: <span className="font-medium">{url}</span></span>
            </div>
            
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Ask a question about the website
            </label>
            <div className={`relative transition-all duration-300 ${inputFocused ? 'ring-2 ring-purple-500' : ''}`}>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                onKeyDown={handleKeyDown}
                placeholder="What is this website about?"
                className="w-full p-3 bg-gray-700/50 rounded-lg border border-gray-600 focus:outline-none min-h-[100px]"
                disabled={loading}
              />
              <button
                onClick={ask}
                disabled={loading || !question}
                className="absolute right-2 bottom-2 px-4 py-1 bg-cyan-600 hover:bg-cyan-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Thinking...' : 'Ask'}
              </button>
            </div>
          </motion.div>
        )}
        
        {answer && (
          <motion.div 
            className="mt-6 p-4 bg-gray-700/40 rounded-lg border border-gray-600"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-lg font-medium mb-2 text-cyan-400">Answer</h3>
            <div className="prose prose-invert max-w-none">
              {answer.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </motion.div>
        )}
        
        <motion.p 
          className="text-xs text-gray-500 mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          TraceNet - Web Content Analysis Tool by Rithvik Dirisala
        </motion.p>
      </motion.div>
    </div>
  );
}