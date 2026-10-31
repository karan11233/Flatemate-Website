import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  PhoneCall, 
  CheckCheck 
} from 'lucide-react';
import { FlatListing, FlatmateProfile } from '../types';

interface ChatModalProps {
  recipient: FlatListing | FlatmateProfile | null;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'recipient';
  text: string;
  time: string;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  recipient,
  onClose,
}) => {
  if (!recipient) return null;

  const isFlat = 'postedBy' in recipient;
  const name = isFlat ? recipient.postedBy.name : recipient.name;
  const avatar = isFlat ? recipient.postedBy.avatar : recipient.avatar;
  const role = isFlat ? recipient.postedBy.role : recipient.profession;
  const responseTime = isFlat ? recipient.postedBy.responseTime : recipient.responseTime;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'recipient',
      text: `Hey there! Thanks for reaching out regarding ${isFlat ? recipient.title : 'finding a flatmate together'}. How can I help you?`,
      time: 'Just now',
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const icebreakers = [
    'Is this room still available?',
    'Are electricity and WiFi included in the rent?',
    'Can we schedule a 10-min phone call to discuss?',
    'What is the deposit and notice period?'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // Simulate instant friendly reply
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const replyMsg: Message = {
        id: `reply-${Date.now()}`,
        sender: 'recipient',
        text: `Thanks for the message! Yes, everything is verified and up-to-date. I can definitely share more photos or arrange a walkthrough this weekend!`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, replyMsg]);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full h-[600px] shadow-2xl border border-slate-200 flex flex-col relative overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Chat Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={avatar}
                alt={name}
                className="w-10 h-10 rounded-2xl object-cover border border-slate-200"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm text-slate-900">{name}</h3>
                <span className="text-emerald-600" title="Verified Member">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium block">
                {role} • <span className="text-emerald-600 font-semibold">{responseTime}</span>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Log */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/70">
          {/* Security Notice */}
          <div className="text-center">
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200/80 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verified Direct Chat • Zero Brokerage Guarantee
            </span>
          </div>

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs font-medium shadow-2xs ${
                  msg.sender === 'user'
                    ? 'bg-brand-600 text-white rounded-br-xs'
                    : 'bg-white text-slate-800 rounded-bl-xs border border-slate-200/80'
                }`}
              >
                {msg.text}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 px-1">
                <span>{msg.time}</span>
                {msg.sender === 'user' && <CheckCheck className="w-3 h-3 text-brand-600" />}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-1.5 bg-white border border-slate-200/80 px-3 py-2 rounded-2xl w-fit">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Icebreaker Prompt Pills */}
        <div className="px-3 pt-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar">
          {icebreakers.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(prompt)}
              className="text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg shrink-0 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Message Input Box */}
        <div className="p-3 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message ${name}...`}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-hidden bg-slate-50 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
