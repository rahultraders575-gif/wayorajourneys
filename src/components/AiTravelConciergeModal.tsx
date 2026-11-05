import React, { useState, useRef, useEffect } from 'react';
import { useCms } from '../context/CmsContext';
import { 
  Sparkles, Send, X, Bot, User, ArrowRight, 
  MapPin, Clock, ShieldCheck, Compass, Car, RefreshCw
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestedRoute?: {
    origin: string;
    destination: string;
    tourName?: string;
  };
  timestamp: string;
}

const QUICK_PROMPTS = [
  { label: 'Tirupati Darshan Tips', query: 'What is the best route and departure time for Tirupati Balaji Darshan from Hyderabad?' },
  { label: 'Srisailam Ghat Advisory', query: 'What are the night gate opening timings and ghat road advice for Srisailam?' },
  { label: 'Araku 3-Day Family Tour', query: 'Plan a 3-day family road trip from Hyderabad to Araku Valley and Vizag with Innova Crysta.' },
  { label: 'Corporate GST Invoicing', query: 'How does corporate booking work with GST tax credit for executive cabs?' },
];

// Rich Fallback Knowledge Base if Gemini API key is not configured in local environment
const KNOWLEDGE_RESPONSES: Record<string, string> = {
  tirupati: `**Tirupati Balaji Highway Advisory (Hyderabad ⇄ Tirupati)**:
• **Distance & Time**: ~560 km via NH44 & NH71 (approx. 9.5 to 10 hours driving).
• **Recommended Timing**: Start early at 04:30 AM to clear Hyderabad Outer Ring Road (ORR) smoothly and reach Kurnool by 08:30 AM for breakfast.
• **Chauffeur Fleet Recommendation**: **Toyota Innova Crysta (6+1)** or **Innova Hycross Hybrid** for superior high-speed highway damping and reclining second-row captain chairs.
• **Darshan Protocol**: Alipiri checkpost operates round the clock. Our captains hold commercial All-India Tourist Permits (AITP) and yellow-board FASTag, ensuring zero border halting.`,

  srisailam: `**Srisailam Jyotirlinga Road Advisory**:
• **Distance & Time**: ~215 km via Srisailam Highway / NH765 (approx. 4.5 to 5 hours).
• **Forest Checkpost Timings**: Munnanur & Dindi forest gates are strictly closed from **9:00 PM to 6:00 AM** to protect Amrabad Tiger Reserve wildlife. Plan your Hyderabad departure before 2:00 PM or after 5:00 AM.
• **Ghat Advisory**: The 35-km ghat section has multiple hairpin bends. Wayora chauffeurs undergo mandatory ghat-route speed certification with commercial speed governors.
• **Vehicle Recommendation**: **Innova Crysta** or **Toyota Fortuner 4x4** for hill-climb torque.`,

  araku: `**Araku Valley & Visakhapatnam 3-Day Luxury Itinerary**:
• **Day 1**: Hyderabad ⇄ Vijayawada ⇄ Rajahmundry ⇄ Vizag (NH65 & NH16). Scenic coastal highway sunset.
• **Day 2**: Vizag to Araku Valley via Ananthagiri Coffee Plantations & Borra Caves. Overnight luxury resort stay in Araku.
• **Day 3**: Katiki Waterfalls, Padmapuram Gardens, and evening return transit to Hyderabad.
• **Package Rate**: Billed at fixed round-trip rate (₹19/km) with night driver allowance (₹400/night) and FASTag interstate toll pass included.`,

  corporate: `**Corporate Travel & GST Tax Invoicing**:
• **Tax Credit**: All bookings issue official 1-click GST-compliant tax invoices with 5% GST input tax credit for registered business entities.
• **Vehicle Standard**: Executive Sedans (Dzire, Ciaz) and Luxury MPVs (Innova Crysta, Fortuner VIP) with bottled mineral water, tissue box, and phone charging docks.
• **Corporate Portal**: Switch to Corporate Account in Rider Dashboard to maintain centralized billing ledgers and monthly department reports.`,
};

export const AiTravelConciergeModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { openBookingModal } = useCms();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: 'Welcome to the **Wayora Journeys Luxury Travel Concierge**! I can assist you with real-time highway route planning, temple darshan timings, outstation cab comparisons, and corporate GST pricing. How may I assist your upcoming journey?',
      timestamp: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputText).trim();
    if (!prompt) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      // 1. Live Backend Gemini AI Request
      const res = await fetch('/api/ai/concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          history: messages.map((m) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          })),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: data.reply,
            timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        setIsTyping(false);
        return;
      }
    } catch {
      // Fall through to smart offline knowledge base
    }

    // 2. Intelligent Smart Fallback if Gemini API Key is unconfigured
    setTimeout(() => {
      const lower = prompt.toLowerCase();
      let responseText = '';
      let suggestedRoute: ChatMessage['suggestedRoute'] | undefined = undefined;

      if (lower.includes('tirupati') || lower.includes('balaji')) {
        responseText = KNOWLEDGE_RESPONSES.tirupati;
        suggestedRoute = { origin: 'Hyderabad', destination: 'Tirupati', tourName: 'Tirupati Balaji Darshan' };
      } else if (lower.includes('srisailam') || lower.includes('ghat') || lower.includes('forest')) {
        responseText = KNOWLEDGE_RESPONSES.srisailam;
        suggestedRoute = { origin: 'Hyderabad', destination: 'Srisailam', tourName: 'Srisailam Mallikarjuna Jyotirlinga' };
      } else if (lower.includes('araku') || lower.includes('vizag') || lower.includes('family')) {
        responseText = KNOWLEDGE_RESPONSES.araku;
        suggestedRoute = { origin: 'Hyderabad', destination: 'Araku Valley', tourName: 'Araku Valley & Coastal Vizag' };
      } else if (lower.includes('corporate') || lower.includes('gst') || lower.includes('invoice') || lower.includes('tax')) {
        responseText = KNOWLEDGE_RESPONSES.corporate;
      } else {
        responseText = `Thank you for consulting Wayora Concierge! For customized highway quotes, airport pickups, or temple charters from **${prompt}**, our dispatch coordinators recommend booking at least 2 hours in advance. Standard tariff includes sanitized AC vehicles, verified commercial drivers, and live FASTag highway toll logging.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: responseText,
          suggestedRoute,
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsTyping(false);
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-lg w-full h-[620px] max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Stage */}
        <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 p-4 text-white flex items-center justify-between border-b border-rose-900/40 relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center shadow-lg shadow-red-600/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm text-white tracking-tight">Wayora AI Travel Concierge</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[9px] border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Advisor
                </span>
              </div>
              <p className="text-[10px] text-slate-300">
                Route recommendations, temple darshan advice & luxury cab rates
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Compass className="w-3 h-3 text-red-600" />
            <span>Suggestions:</span>
          </span>
          {QUICK_PROMPTS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(item.query)}
              className="text-[10px] px-2.5 py-1 rounded-full bg-white hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200 hover:border-red-300 font-medium whitespace-nowrap transition-colors cursor-pointer shadow-2xs"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/60 text-xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] p-3.5 rounded-2xl space-y-2 shadow-2xs ${
                  msg.role === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none'
                }`}
              >
                <div 
                  className="whitespace-pre-line leading-relaxed text-[11px]"
                  dangerouslySetInnerHTML={{
                    __html: msg.content
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/•/g, '&bull;')
                  }}
                />

                {/* Optional 1-Click Instant Booking Button */}
                {msg.suggestedRoute && (
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        openBookingModal(msg.suggestedRoute?.tourName || 'Outstation Chauffeur Ride');
                      }}
                      className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-red-600/20"
                    >
                      <Car className="w-3 h-3" />
                      <span>Book {msg.suggestedRoute.destination} Journey</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <span className={`text-[9px] block text-right font-mono ${
                  msg.role === 'user' ? 'text-slate-400' : 'text-slate-400'
                }`}>
                  {msg.timestamp}
                </span>
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-slate-400 text-xs pl-9">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.4s]" />
              <span className="text-[10px] font-medium text-slate-500">Concierge analyzing live highway network...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask anything about routes, cabs, tolls, timings..."
            className="flex-1 px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:bg-white focus:border-red-600"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="p-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white cursor-pointer shadow-md shadow-red-600/30 disabled:opacity-40 transition-transform active:scale-95"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

