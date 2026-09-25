import React, { useState } from 'react';
import {
  Train,
  Bus,
  Footprints,
  MapPin,
  Clock,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  CloudRain,
  AlertCircle,
  ExternalLink,
  Code2,
} from 'lucide-react';
import { ComprehensiveJourneyResult, MCPToolExecutionLog } from '../types/transit';

interface JourneyPlanCardProps {
  plan: ComprehensiveJourneyResult;
  toolExecutions?: MCPToolExecutionLog[];
}

export const JourneyPlanCard: React.FC<JourneyPlanCardProps> = ({ plan, toolExecutions }) => {
  const [showToolTrace, setShowToolTrace] = useState(false);

  const getStepIcon = (mode: string) => {
    switch (mode) {
      case 'MRT':
        return <Train className="w-4 h-4 text-white" />;
      case 'BUS':
        return <Bus className="w-4 h-4 text-white" />;
      case 'WALK':
      default:
        return <Footprints className="w-4 h-4 text-white" />;
    }
  };

  const getModeBg = (step: any) => {
    if (step.lineColor) return step.lineColor;
    if (step.mode === 'MRT') return '#0054A6';
    if (step.mode === 'BUS') return '#059669';
    return '#64748b';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs mt-3">
      {/* Origin & Destination Banner */}
      <div className="bg-slate-900 text-white p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[11px] font-mono tracking-wider text-emerald-400 uppercase font-semibold">
              Validated Origin & Destination
            </span>
            <div className="flex items-center gap-2 text-sm sm:text-base font-bold">
              <span className="text-slate-200">{plan.origin.name}</span>
              <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-emerald-300">{plan.destination.name}</span>
            </div>
            <div className="text-xs text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
              {plan.origin.postalCode && <span>Origin Postal: <code className="text-slate-300 font-mono">{plan.origin.postalCode}</code></span>}
              {plan.destination.postalCode && <span>Dest Postal: <code className="text-slate-300 font-mono">{plan.destination.postalCode}</code></span>}
              <span className="font-mono text-[11px] text-slate-500">
                Coords: [{plan.origin.latitude.toFixed(3)}, {plan.origin.longitude.toFixed(3)}] → [{plan.destination.latitude.toFixed(3)}, {plan.destination.longitude.toFixed(3)}]
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 bg-slate-800/80 px-3 py-2 rounded-lg border border-slate-700/60 self-start sm:self-center">
            <div className="text-center px-1">
              <div className="text-[10px] text-slate-400 uppercase font-medium">Total Time</div>
              <div className="text-base font-bold font-mono text-white flex items-center gap-1 justify-center">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                {plan.summary.totalDurationMinutes}m
              </div>
            </div>
            <div className="w-px h-6 bg-slate-700" />
            <div className="text-center px-1">
              <div className="text-[10px] text-slate-400 uppercase font-medium">Transfers</div>
              <div className="text-base font-bold font-mono text-emerald-300">
                {plan.summary.transfers}
              </div>
            </div>
            <div className="w-px h-6 bg-slate-700" />
            <div className="text-center px-1">
              <div className="text-[10px] text-slate-400 uppercase font-medium">Est. Fare</div>
              <div className="text-base font-bold font-mono text-white">
                {plan.summary.fareEstSGD}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weather Impact Bar */}
      {plan.summary.weatherAdjusted && (
        <div className="bg-sky-50 border-b border-sky-100 px-4 py-2 flex items-center justify-between text-xs text-sky-900">
          <div className="flex items-center gap-2">
            <CloudRain className="w-4 h-4 text-sky-600 shrink-0" />
            <span>
              <strong>Weather-Aware Adjustment:</strong> +{plan.summary.weatherBufferMinutes} min buffer added for rain. Covered walkways prioritized.
            </span>
          </div>
          <span className="font-semibold text-sky-700 text-[11px] bg-sky-100 px-2 py-0.5 rounded">
            Rainfall {plan.weatherImpact.rainfallMm}mm
          </span>
        </div>
      )}

      {/* Step-by-Step Directions Timeline */}
      <div className="p-4 sm:p-5">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <span>Optimized Multi-Modal Journey Steps</span>
        </h4>

        <div className="relative border-l-2 border-slate-200 ml-4 space-y-6 pb-2">
          {plan.steps.map((step) => {
            const stepColor = getModeBg(step);

            return (
              <div key={step.step} className="relative pl-6 group">
                {/* Node marker */}
                <div
                  className="absolute -left-[17px] top-0 w-8 h-8 rounded-full flex items-center justify-center shadow-xs border-2 border-white"
                  style={{ backgroundColor: stepColor }}
                >
                  {getStepIcon(step.mode)}
                </div>

                {/* Step content */}
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 hover:border-slate-300 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-900">
                        Step {step.step}: {step.mode === 'MRT' ? 'MRT Transit' : step.mode === 'BUS' ? 'Bus Ride' : 'Walk'}
                      </span>
                      {step.line && (
                        <span
                          className="text-[11px] font-semibold text-white px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: stepColor }}
                        >
                          {step.line}
                        </span>
                      )}
                      {step.isCoveredWalkway && (
                        <span className="text-[10px] font-medium bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded flex items-center gap-1">
                          ☂️ Sheltered Linkway
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono text-slate-500 font-medium">
                      ~{step.durationMinutes} min {step.distanceMeters ? `(${step.distanceMeters}m)` : ''}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    {step.instruction}
                  </p>

                  {step.detail && (
                    <p className="text-xs text-slate-600 mt-1 italic">
                      {step.detail}
                    </p>
                  )}

                  {/* MRT Exit Recommendation */}
                  {step.exitCode && (
                    <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 font-medium">
                      <span className="font-bold">🚇 Station Exit:</span>
                      <code className="bg-white px-1.5 py-0.5 rounded border border-indigo-200 font-mono text-[11px] text-indigo-700">
                        {step.exitCode}
                      </code>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Advisories Footer */}
      {plan.advisories && plan.advisories.length > 0 && (
        <div className="bg-slate-50 border-t border-slate-200 p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 space-y-1">
              <span className="font-bold text-slate-900">Real-Time Travel Advisories:</span>
              <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                {plan.advisories.map((adv, idx) => (
                  <li key={idx}>{adv}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* MCP Tool Execution Trace Toggle */}
      {toolExecutions && toolExecutions.length > 0 && (
        <div className="border-t border-slate-200 bg-white">
          <button
            onClick={() => setShowToolTrace(!showToolTrace)}
            className="w-full px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Code2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>MCP Tool Invocations ({toolExecutions.length} official tool calls executed)</span>
            </span>
            {showToolTrace ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showToolTrace && (
            <div className="p-4 bg-slate-950 text-slate-200 font-mono text-xs space-y-3">
              <div className="text-[11px] text-slate-400 border-b border-slate-800 pb-1">
                Server: <strong className="text-indigo-400">siva-sub/MCP-Public-Transport</strong> • Protocol: <span className="text-emerald-400">Model Context Protocol</span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {toolExecutions.map((log) => (
                  <div key={log.id} className="bg-slate-900 p-2.5 rounded border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-indigo-300 font-bold">⚡ {log.toolName}</span>
                      <span className="text-slate-400">{log.durationMs}ms</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      <strong>Args:</strong> {JSON.stringify(log.input)}
                    </div>
                    <div className="text-[11px] text-emerald-400">
                      <strong>Output:</strong> {log.outputSummary}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
