import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Train,
  Bus,
  Sparkles,
  CloudRain,
  Sliders,
  ShieldCheck,
  RefreshCw,
  MapPin,
  Bot,
  User,
  Info,
} from 'lucide-react';
import { AgentChatMessage } from '../types/transit';
import { JourneyPlanCard } from './JourneyPlanCard';
import { BusArrivalCard } from './BusArrivalCard';

const SAMPLE_QUERIES = [
  {
    label: '🌧️ Suntec City from Little India MRT in heavy rain',
    text: 'How to get to Suntec City from Little India MRT during heavy rain?',
    description: 'Avoids outdoor walking; prioritizes covered walkways and DT Line to Promenade Exit C',
  },
  {
    label: '🧳 Changi Airport to Marina Bay Sands with luggage',
    text: 'Going from Changi Airport to Marina Bay Sands with heavy luggage, minimize transfers.',
    description: 'Single transfer route via Expo DTL avoiding crowded multi-line interchanges',
  },
  {
    label: '⏱️ Jurong East to Orchard (Direct NSL)',
    text: 'Route from Jurong East to Orchard with current MRT and weather checks.',
    description: 'Fast direct North-South Line with zero transfers',
  },
  {
    label: '🚌 Live bus arrival for stop 83139',
    text: 'Live bus arrival for stop 83139 (Opp Blk 910, Tampines)',
    description: 'Real-time arrival countdowns and passenger crowding levels (Seats/Standing)',
  },
  {
    label: '🚶 Bugis to Kampong Glam walking advisory',
    text: 'Check weather advisory and walking comfort from Bugis to Kampong Glam.',
    description: 'Evaluates tropical temperature, rainfall radar, and walking comfort',
  },
];

export const AiStrategistChat: React.FC = () => {
  const [messages, setMessages] = useState<AgentChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `### Welcome to the Singapore AI Transit Strategist!
I am your dedicated **AI Travel Assistant and Mobility Strategist for Singapore**, powered directly by the official \`siva-sub/MCP-Public-Transport\` Model Context Protocol server.

I help you navigate Singapore efficiently by:
- 🗺️ **Validating Locations:** High-precision postal codes (e.g. \`039594\`), buildings, and MRT stations.
- 🚇 **Minimizing Transfers:** Intelligent multi-modal routing across EWL, NSL, NEL, CCL, DTL, TEL, and bus networks.
- 🌧️ **Weather-Aware Optimization:** Factoring real-time Singapore NEA rainfall nowcasts into walking buffers and recommending sheltered station exits (like Exit E or Exit C).
- 🚌 **Live Bus Crowding:** Retrieving real-time bus arrivals with passenger load levels (**Seats Available**, **Standing Available**, **Limited Standing**).

Choose a sample query below or type your destination!`,
      timestamp: new Date().toISOString(),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modePreference, setModePreference] = useState<'AUTO' | 'PUBLIC_TRANSPORT' | 'WALK' | 'DRIVE'>('PUBLIC_TRANSPORT');
  const [weatherAware, setWeatherAware] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (queryText?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || isLoading) return;

    setInput('');

    // Append user message
    const userMsg: AgentChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/agent/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          mode: modePreference,
          weatherAware,
        }),
      });

      if (!res.ok) {
        throw new Error(`Agent query failed with HTTP ${res.status}`);
      }

      const data: AgentChatMessage = await res.json();
      setMessages((prev) => [...prev, data]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: `⚠️ **Unable to complete query via MCP Server:** ${err.message}. Please check that the server is active.`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-5xl mx-auto px-4 py-4">
      {/* Quick Prompts Bar */}
      <div className="mb-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Quick Singapore Mobility Scenarios</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {SAMPLE_QUERIES.map((sq, idx) => (
            <button
              key={idx}
              onClick={() => handleSubmit(sq.text)}
              disabled={isLoading}
              title={sq.description}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-medium hover:border-red-500 hover:text-red-600 hover:bg-red-50/50 transition-all shrink-0 cursor-pointer shadow-2xs disabled:opacity-50"
            >
              {sq.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className={`max-w-3xl ${msg.role === 'user' ? 'w-auto' : 'w-full'}`}>
              <div
                className={`p-4 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-red-600 text-white font-medium text-sm ml-auto rounded-tr-xs shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-800 text-sm shadow-xs rounded-tl-xs'
                }`}
              >
                {/* Formatted Markdown Content */}
                <div className="prose prose-sm max-w-none text-slate-800 space-y-2 whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </div>

                {/* Structured Journey Plan Card */}
                {msg.structuredPlan && (
                  <JourneyPlanCard
                    plan={msg.structuredPlan}
                    toolExecutions={msg.toolExecutions}
                  />
                )}

                {/* Bus Arrivals Card if queried */}
                {msg.realTimeAdvisories?.busArrivals && msg.realTimeAdvisories.busArrivals.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {msg.realTimeAdvisories.busArrivals.map((b) => (
                      <BusArrivalCard key={b.busStopCode} arrivalData={b} />
                    ))}
                  </div>
                )}
              </div>

              <div
                className={`text-[11px] text-slate-400 mt-1 px-1 flex items-center gap-2 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {msg.role === 'assistant' && msg.toolExecutions && (
                  <span className="text-indigo-600 font-mono text-[10px]">
                    • {msg.toolExecutions.length} MCP tools invoked
                  </span>
                )}
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 mt-1">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-xs shadow-xs space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-red-600" />
                <span>Orchestrating official siva-sub/MCP-Public-Transport tools...</span>
              </div>
              <p className="text-slate-500 font-mono text-[11px]">
                Calling: search_location → get_weather_conditions → get_train_service_status → plan_comprehensive_journey
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box & Preferences Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-sm">
        {/* Preference Toggles */}
        <div className="flex items-center justify-between px-2 pb-2 mb-1 border-b border-slate-100 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-500 font-semibold flex items-center gap-1">
              <Sliders className="w-3 h-3" /> Mode:
            </span>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
              <button
                type="button"
                onClick={() => setModePreference('PUBLIC_TRANSPORT')}
                className={`px-2 py-0.5 rounded-md font-medium text-xs transition-all ${
                  modePreference === 'PUBLIC_TRANSPORT'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Transit (MRT+Bus)
              </button>
              <button
                type="button"
                onClick={() => setModePreference('WALK')}
                className={`px-2 py-0.5 rounded-md font-medium text-xs transition-all ${
                  modePreference === 'WALK'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Walk
              </button>
              <button
                type="button"
                onClick={() => setModePreference('DRIVE')}
                className={`px-2 py-0.5 rounded-md font-medium text-xs transition-all ${
                  modePreference === 'DRIVE'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Drive/Taxi
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 hover:text-slate-900 select-none">
              <input
                type="checkbox"
                checked={weatherAware}
                onChange={(e) => setWeatherAware(e.target.checked)}
                className="w-3.5 h-3.5 text-red-600 rounded border-slate-300 focus:ring-red-500"
              />
              <span className="flex items-center gap-1 text-[11px] font-medium">
                <CloudRain className="w-3 h-3 text-sky-600" />
                Weather-Aware
              </span>
            </label>
          </div>
        </div>

        {/* Text Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask route, postal code (e.g. 039594), bus stop arrival (e.g. 83139), or weather advisory..."
            disabled={isLoading}
            className="flex-1 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-red-600 text-white rounded-xl font-semibold text-xs flex items-center gap-1.5 hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
