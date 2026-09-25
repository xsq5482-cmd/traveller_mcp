import React, { useState, useEffect } from 'react';
import { Train, ShieldCheck, Cpu, CloudRain, Sun, Activity } from 'lucide-react';
import { WeatherConditions } from '../types/transit';

interface HeaderProps {
  weather: WeatherConditions | null;
  serverInfo: any;
  activeTab: 'agent' | 'transit' | 'mcp';
  setActiveTab: (tab: 'agent' | 'transit' | 'mcp') => void;
}

export const Header: React.FC<HeaderProps> = ({ weather, serverInfo, activeTab, setActiveTab }) => {
  const [sgTime, setSgTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format to Singapore Time (UTC+8)
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Singapore',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      };
      setSgTime(new Intl.DateTimeFormat('en-SG', options).format(now));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const hasRain = weather && (weather.rainfall > 0 || weather.twoHourForecast.toLowerCase().includes('rain'));

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md font-bold text-lg tracking-wider">
            🇸🇬
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                Singapore AI Transit Strategist
              </h1>
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-2">
              <span>Powered by official <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono text-[11px]">siva-sub/MCP-Public-Transport</code></span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 font-mono">{sgTime} SGT</span>
            </p>
          </div>
        </div>

        {/* Live Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Weather pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-700">
            {hasRain ? (
              <CloudRain className="w-4 h-4 text-sky-600 animate-bounce" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}
            <span className="font-medium">
              {weather ? `${weather.temperature}°C • ${weather.twoHourForecast}` : '2-Hr Weather Live'}
            </span>
            {hasRain && (
              <span className="text-[10px] bg-sky-100 text-sky-800 font-semibold px-1 rounded">
                Rain Alert
              </span>
            )}
          </div>

          {/* Guardrail status pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-medium">Read-Only Guardrail Active</span>
          </div>

          {/* Connected MCP Server pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 font-mono">
            <Cpu className="w-3.5 h-3.5 text-indigo-500" />
            <span>MCP v0.3.0</span>
          </div>
        </div>
      </div>

      {/* Tabs bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 border-t border-slate-100 flex gap-2">
        <button
          onClick={() => setActiveTab('agent')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'agent'
              ? 'border-red-600 text-red-600 bg-red-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Train className="w-4 h-4" />
          <span>AI Mobility Strategist & Journey Planner</span>
        </button>

        <button
          onClick={() => setActiveTab('transit')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'transit'
              ? 'border-red-600 text-red-600 bg-red-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Live Transit & Weather Board</span>
        </button>

        <button
          onClick={() => setActiveTab('mcp')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'mcp'
              ? 'border-red-600 text-red-600 bg-red-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>MCP Server & Tool Inspector</span>
        </button>
      </div>
    </header>
  );
};
