import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { 
  MessageCircle, Send, AlertCircle, Apple, Leaf,
  ChefHat, Calendar, Heart, ChevronRight, Droplets
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Chat() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your NutraWell Nutrition Coach. I can help you with healthy meal ideas, recipe suggestions, calorie guidance, and wellness tips. What would you like to know?"
    }
  ]);
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim()) return;
    setErrorMsg('');
    const userMessage = { role: 'user', content: textToSend };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/ai/chat', {
        messages: updatedMessages.map(m => ({ role: m.role, content: m.content }))
      });
      setMessages([...updatedMessages, { role: 'assistant', content: response.message }]);
    } catch (err) {
      setErrorMsg(typeof err === 'string' ? err : 'Unable to reach your nutrition coach. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  const coachingModules = [
    { title: 'Meal Suggestions', desc: 'Low-calorie meal ideas for any time of day.', prompt: 'Can you suggest a healthy, low-calorie dinner under 400 kcal?', icon: ChefHat, bg: '#E8F5E9', color: '#2E7D32' },
    { title: 'Healthy Swaps', desc: 'Find nutritious alternatives to your favourites.', prompt: 'What are healthy, low-fat alternatives to mayonnaise?', icon: Heart, bg: '#F7F2FF', color: '#8E7CC3' },
    { title: 'Nutrition Facts', desc: 'Understand the macros in common foods.', prompt: 'How many calories and protein are in an average avocado?', icon: Apple, bg: '#E8F5E9', color: '#2E7D32' },
    { title: 'Meal Planning', desc: 'Structure a balanced weekly meal schedule.', prompt: 'How do I structure a high-protein, low-carb weekly meal plan?', icon: Calendar, bg: '#F7F2FF', color: '#8E7CC3' },
    { title: 'Hydration Tips', desc: 'Water intake goals based on your activity.', prompt: 'How much water should I drink daily for weight loss?', icon: Droplets, bg: '#E8F5E9', color: '#2E7D32' },
  ];

  const quickChips = [
    'Healthy breakfast ideas',
    'Post-workout meals',
    'Vegetarian protein sources',
    'Low-carb snacks',
  ];

  return (
    <div className="flex flex-col gap-6 py-6 text-left flex-grow h-[calc(100vh-11rem)] max-h-[820px] overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex flex-col gap-1">
          <span className="section-label">Your Personal Coach</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Nutrition <span className="text-[#2E7D32]">Coach</span></h1>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#E8F5E9] rounded-full border border-[#C8E6C9]">
          <div className="h-2 w-2 rounded-full bg-[#2E7D32] animate-pulse" />
          <span className="text-xs font-semibold text-[#2E7D32]">Online</span>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex-grow flex flex-col lg:grid lg:grid-cols-12 gap-6 overflow-hidden h-full">

        {/* Left sidebar: Quick topics */}
        <div className="hidden lg:flex lg:col-span-4 flex-col gap-4 overflow-y-auto pr-1">
          <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2">Quick Topics</h3>
          <div className="flex flex-col gap-3">
            {coachingModules.map((module, i) => (
              <button
                key={i}
                onClick={() => !loading && handleSendMessage(module.prompt)}
                disabled={loading}
                className="p-4 bg-white border border-gray-100 rounded-xl hover:border-[#2E7D32]/30 hover:shadow-sm transition-all text-left group flex gap-3 items-start"
              >
                <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: module.bg }}>
                  <module.icon className="h-4.5 w-4.5" style={{ color: module.color }} />
                </div>
                <div className="flex flex-col gap-0.5 flex-1">
                  <span className="text-xs font-semibold text-gray-800 group-hover:text-[#2E7D32] transition-colors flex justify-between items-center">
                    {module.title}
                    <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#2E7D32]" />
                  </span>
                  <span className="text-[10px] text-gray-400 leading-relaxed">{module.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Chat window */}
        <div className="lg:col-span-8 flex flex-col overflow-hidden h-full bg-white rounded-2xl border border-gray-100 shadow-card">

          {/* Messages */}
          <div className="flex-grow p-5 overflow-y-auto flex flex-col gap-4 bg-[#FAFAFA]">
            {messages.map((msg, i) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-3 items-start ${isAssistant ? 'justify-start' : 'justify-end flex-row-reverse'}`}
                >
                  {/* Avatar */}
                  <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center ${
                    isAssistant
                      ? 'bg-[#E8F5E9] border border-[#C8E6C9]'
                      : 'bg-[#F7F2FF] border border-[#E8E2F8]'
                  }`}>
                    {isAssistant
                      ? <Leaf className="h-4 w-4 text-[#2E7D32]" />
                      : <Heart className="h-4 w-4 text-[#8E7CC3]" />
                    }
                  </div>

                  {/* Bubble */}
                  <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    isAssistant
                      ? 'bg-white border border-gray-100 text-gray-700 rounded-tl-none shadow-sm'
                      : 'bg-[#2E7D32] text-white rounded-tr-none'
                  }`}>
                    <p className="whitespace-pre-line text-left">{msg.content}</p>
                  </div>
                </motion.div>
              );
            })}

            {/* Typing indicator */}
            {loading && (
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-[#E8F5E9] border border-[#C8E6C9] flex items-center justify-center">
                  <Leaf className="h-4 w-4 text-[#2E7D32]" />
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1.5 items-center shadow-sm">
                  <span className="h-2 w-2 bg-[#8E7CC3] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 bg-[#8E7CC3] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 bg-[#8E7CC3] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 text-xs text-red-600 rounded-xl self-center">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick chips */}
          <div className="px-4 py-2.5 border-t border-gray-100 bg-white flex gap-2 overflow-x-auto shrink-0">
            {quickChips.map(chip => (
              <button
                key={chip}
                onClick={() => !loading && handleSendMessage(chip)}
                disabled={loading}
                className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-full bg-[#F7F2FF] text-[#8E7CC3] border border-[#E8E2F8] hover:bg-[#8E7CC3] hover:text-white transition-colors disabled:opacity-40"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-100 bg-white shrink-0">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Ask about meals, macros, or healthy habits..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                className="input-field flex-1"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="h-10 w-10 shrink-0 rounded-xl bg-[#2E7D32] hover:bg-[#256428] text-white flex items-center justify-center disabled:opacity-40 transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Chat;
