import React from 'react';
import { Bus, Users, Clock, Accessibility } from 'lucide-react';
import { BusStopArrivalResult } from '../types/transit';

interface BusArrivalCardProps {
  arrivalData: BusStopArrivalResult;
}

export const BusArrivalCard: React.FC<BusArrivalCardProps> = ({ arrivalData }) => {
  const getLoadBadge = (load: string) => {
    switch (load) {
      case 'Seats Available':
      case 'SEA':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Seats Avail
          </span>
        );
      case 'Standing Available':
      case 'SDA':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Standing Avail
          </span>
        );
      case 'Limited Standing':
      case 'LSD':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Limited Standing
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      {/* Stop Header */}
      <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-600/30 text-emerald-400">
            <Bus className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">{arrivalData.description}</span>
              <span className="font-mono text-xs bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                #{arrivalData.busStopCode}
              </span>
            </div>
            <p className="text-xs text-slate-400">{arrivalData.roadName}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LTA Live
          </span>
        </div>
      </div>

      {/* Services List */}
      <div className="divide-y divide-slate-100">
        {arrivalData.services.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500">No active services right now.</div>
        ) : (
          arrivalData.services.map((svc) => (
            <div key={svc.serviceNo} className="p-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-12 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-900 text-sm tracking-wide shadow-2xs">
                  {svc.serviceNo}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-700">{svc.operator}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1 rounded">
                      {svc.nextBus.type}
                    </span>
                    {svc.nextBus.feature === 'WAB' && (
                      <span title="Wheelchair Accessible Bus" className="text-slate-500">
                        <Accessibility className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                    {svc.nextBus2 && (
                      <span>Next: <strong className="text-slate-700">{svc.nextBus2.durationMinutes}m</strong> ({svc.nextBus2.load})</span>
                    )}
                    {svc.nextBus3 && (
                      <span>Subsequent: <strong className="text-slate-700">{svc.nextBus3.durationMinutes}m</strong></span>
                    )}
                  </div>
                </div>
              </div>

              {/* Countdown & Crowd Level */}
              <div className="flex items-center gap-3 self-end sm:self-center">
                {getLoadBadge(svc.nextBus.load)}

                <div className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1 rounded-lg text-xs font-bold font-mono">
                  <Clock className="w-3 h-3 text-emerald-400" />
                  {svc.nextBus.durationMinutes <= 1 ? (
                    <span className="text-emerald-300 animate-pulse">Arr</span>
                  ) : (
                    <span>{svc.nextBus.durationMinutes} min</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
