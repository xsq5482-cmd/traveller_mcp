import React, { useState, useEffect } from 'react';
import {
  Train,
  Bus,
  CloudRain,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Users,
  Compass,
  Thermometer,
  Wind,
} from 'lucide-react';
import { TrainLineStatus, BusStopArrivalResult, WeatherConditions } from '../types/transit';
import { BusArrivalCard } from './BusArrivalCard';

interface LiveTransitBoardProps {
  weather: WeatherConditions | null;
  onRefreshWeather: () => void;
}

export const LiveTransitBoard: React.FC<LiveTransitBoardProps> = ({ weather, onRefreshWeather }) => {
  const [trainLines, setTrainLines] = useState<TrainLineStatus[]>([]);
  const [overallTrainStatus, setOverallTrainStatus] = useState<string>('Loading train status...');
  const [busStopInput, setBusStopInput] = useState<string>('83139');
  const [busArrival, setBusArrival] = useState<BusStopArrivalResult | null>(null);
  const [isLoadingBus, setIsLoadingBus] = useState<boolean>(false);
  const [isLoadingTrains, setIsLoadingTrains] = useState<boolean>(false);

  // Fetch train lines status
  const fetchTrains = async () => {
    setIsLoadingTrains(true);
    try {
      const res = await fetch('/api/live/trains');
      if (res.ok) {
        const data = await res.json();
        setTrainLines(data.lines || []);
        setOverallTrainStatus(data.overallStatus || 'Normal Service across all lines.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingTrains(false);
    }
  };

  // Fetch bus arrival for code
  const fetchBusArrival = async (code: string) => {
    setIsLoadingBus(true);
    try {
      const res = await fetch(`/api/live/bus-arrival?busStopCode=${encodeURIComponent(code)}`);
      if (res.ok) {
        const data = await res.json();
        setBusArrival(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingBus(false);
    }
  };

  useEffect(() => {
    fetchTrains();
    fetchBusArrival('83139');
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-red-600" />
            <span>Singapore Live Transit & Weather Operations</span>
          </h2>
          <p className="text-xs text-slate-500">
            Real-time telemetry from Land Transport Authority (LTA) and National Environment Agency (NEA)
          </p>
        </div>

        <button
          onClick={() => {
            fetchTrains();
            fetchBusArrival(busStopInput);
            onRefreshWeather();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-2xs self-start sm:self-center cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTrains || isLoadingBus ? 'animate-spin' : ''}`} />
          <span>Refresh Live Telemetry</span>
        </button>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: MRT Status & Weather */}
        <div className="lg:col-span-2 space-y-6">
          {/* MRT / LRT Lines Status Grid */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Train className="w-4 h-4 text-slate-700" />
                <h3 className="font-bold text-slate-900 text-sm">MRT & LRT Line Network Health</h3>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Normal Operations
              </span>
            </div>

            <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
              {overallTrainStatus}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {trainLines.map((line) => (
                <div
                  key={line.code}
                  className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-3 h-8 rounded-sm"
                      style={{ backgroundColor: line.color }}
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900">{line.code}</span>
                        <span className="text-[11px] text-slate-500 font-medium truncate max-w-[100px]">
                          {line.name}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">{line.lastUpdated}</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    {line.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Singapore 2-Hour Weather & Rain Radar */}
          {weather && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CloudRain className="w-4 h-4 text-sky-600" />
                  <h3 className="font-bold text-slate-900 text-sm">NEA Weather & Rainfall Nowcast</h3>
                </div>
                <span className="text-xs font-mono text-slate-500">2-Hour Forecast</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-amber-500" /> Temp
                  </div>
                  <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">
                    {weather.temperature}°C
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <CloudRain className="w-3.5 h-3.5 text-sky-500" /> Rainfall
                  </div>
                  <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">
                    {weather.rainfall} mm
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Wind className="w-3.5 h-3.5 text-slate-500" /> Wind
                  </div>
                  <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">
                    {weather.windSpeed} km/h
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-emerald-500" /> Comfort
                  </div>
                  <div className="text-sm font-bold text-slate-900 truncate mt-1">
                    {weather.comfortLevel}
                  </div>
                </div>
              </div>

              <div className="bg-sky-50 border border-sky-200/80 rounded-lg p-3 text-xs text-sky-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <span>Current Weather Condition:</span>
                  <span className="bg-sky-200/70 text-sky-800 px-1.5 py-0.5 rounded font-mono">
                    {weather.twoHourForecast}
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed">{weather.travelAdvisory}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Bus Arrival Checker */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Bus className="w-4 h-4 text-emerald-600" />
                <span>Live Bus Arrival Checker</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Query any 5-digit Singapore bus stop code for arrival countdowns & crowd load.
              </p>
            </div>

            {/* Stop Code Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (busStopInput.trim()) {
                  fetchBusArrival(busStopInput.trim());
                }
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={busStopInput}
                onChange={(e) => setBusStopInput(e.target.value)}
                placeholder="Bus Stop Code (e.g. 83139, 01012)"
                className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-red-500 font-mono"
              />
              <button
                type="submit"
                disabled={isLoadingBus}
                className="px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Check</span>
              </button>
            </form>

            {/* Quick Stop Buttons */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Popular Bus Stops:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { code: '83139', name: 'Opp Blk 910' },
                  { code: '01012', name: 'Hotel Rendezvous' },
                  { code: '03071', name: 'Suntec City' },
                  { code: '09048', name: 'Orchard Plaza' },
                  { code: '04168', name: 'Little India Stn' },
                  { code: '28009', name: 'Jurong East Int' },
                ].map((s) => (
                  <button
                    key={s.code}
                    type="button"
                    onClick={() => {
                      setBusStopInput(s.code);
                      fetchBusArrival(s.code);
                    }}
                    className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded font-mono transition-colors cursor-pointer"
                  >
                    #{s.code} ({s.name})
                  </button>
                ))}
              </div>
            </div>

            {/* Crowding Legend */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-700 block">LTA Crowding Legend:</span>
              <div className="flex flex-col gap-1 text-[11px] text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span><strong>Seats Available (SEA):</strong> Seating available</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span><strong>Standing Available (SDA):</strong> Standing room only</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span><strong>Limited Standing (LSD):</strong> Heavily crowded</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Bus Arrival Result */}
          {busArrival && <BusArrivalCard arrivalData={busArrival} />}
        </div>
      </div>
    </div>
  );
};
