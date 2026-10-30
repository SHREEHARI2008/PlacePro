import React, { useState } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles } from 'lucide-react';

export default function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am your Placement & Career AI Assistant. Ask me about upcoming company eligibility, LeetCode topics, or interview tips.'
    }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setInput('');

    setTimeout(() => {
      let reply = "Your academic standing and LeetCode problem solving consistency make you competitive for Tier-1 placement drives like Google, Microsoft, and Zoho. Focus on Graphs and Dynamic Programming this week!";
      if (userText.toLowerCase().includes('eligib')) {
        reply = "Based on your verified CGPA (9.40) and zero backlogs, you are eligible for 100% of upcoming visiting campus drives.";
      } else if (userText.toLowerCase().includes('leetcode') || userText.toLowerCase().includes('code')) {
        reply = "With over 540 problems solved (280 Easy, 210 Medium, 52 Hard), your algorithmic profile ranks in the top 5% of your batch!";
      }
      setMessages((prev) => [...prev, { sender: 'bot', text: reply }]);
    }, 600);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#1a5cff] hover:bg-[#154ecc] text-white flex items-center justify-center shadow-lg shadow-[#1a5cff]/35 transition-all duration-200 hover:scale-105 active:scale-95"
        title="Placement Chat Assistant"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6 fill-white" />}
      </button>

      {/* Interactive Chat Popup */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[480px] animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-[#0b1940] text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#1a5cff] flex items-center justify-center text-white">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">PlaceMentor Assistant</h3>
                <span className="text-[11px] text-emerald-400 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Online & Ready</span>
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#f8fafc] text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[82%] p-3 rounded-2xl leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#1a5cff] text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-xs'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Footer Input */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask placement query..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#1a5cff]/40"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-[#1a5cff] hover:bg-[#154ecc] text-white transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
