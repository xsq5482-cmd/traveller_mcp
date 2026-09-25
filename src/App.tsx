import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AiStrategistChat } from './components/AiStrategistChat';
import { LiveTransitBoard } from './components/LiveTransitBoard';
import { McpInspector } from './components/McpInspector';
import { WeatherConditions } from './types/transit';

export default function App() {
  const [activeTab, setActiveTab] = useState<'agent' | 'transit' | 'mcp'>('agent');
  const [weather, setWeather] = useState<WeatherConditions | null>(null);
  const [serverInfo, setServerInfo] = useState<any>(null);

  const fetchWeather = async () => {
    try {
      const res = await fetch('/api/live/weather');
      if (res.ok) {
        const data = await res.json();
        setWeather(data);
      }
    } catch (e) {
      console.warn('Weather fetch error:', e);
    }
  };

  const fetchServerInfo = async () => {
    try {
      const res = await fetch('/api/mcp/info');
      if (res.ok) {
        const data = await res.json();
        setServerInfo(data);
      }
    } catch (e) {
      console.warn('Server info fetch error:', e);
    }
  };

  useEffect(() => {
    fetchWeather();
    fetchServerInfo();

    // Auto-refresh weather every 2 minutes
    const interval = setInterval(fetchWeather, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* App Header */}
      <Header
        weather={weather}
        serverInfo={serverInfo}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'agent' && <AiStrategistChat />}
        {activeTab === 'transit' && (
          <LiveTransitBoard weather={weather} onRefreshWeather={fetchWeather} />
        )}
        {activeTab === 'mcp' && <McpInspector serverInfo={serverInfo} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-3 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            Singapore AI Transit Strategist • Powered by Model Context Protocol (MCP) server{' '}
            <a
              href="https://github.com/siva-sub/MCP-Public-Transport"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-600 hover:underline font-mono font-medium"
            >
              siva-sub/MCP-Public-Transport
            </a>
          </p>
          <p className="text-[11px] text-slate-400">
            Read-only operations strictly • Real-time OneMap, LTA DataMall, and NEA Open Data feeds
          </p>
        </div>
      </footer>
    </div>
  );
}
