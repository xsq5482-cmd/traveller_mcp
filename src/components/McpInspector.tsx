import React, { useState } from 'react';
import {
  Cpu,
  Code2,
  CheckCircle2,
  ShieldCheck,
  ExternalLink,
  Play,
  RefreshCw,
  Layers,
  Terminal,
} from 'lucide-react';

interface McpInspectorProps {
  serverInfo: any;
}

export const McpInspector: React.FC<McpInspectorProps> = ({ serverInfo }) => {
  const [selectedTool, setSelectedTool] = useState<string>('plan_comprehensive_journey');
  const [toolArgsJson, setToolArgsJson] = useState<string>(
    JSON.stringify(
      {
        fromLocation: 'Little India MRT',
        toLocation: 'Suntec City',
        mode: 'PUBLIC_TRANSPORT',
      },
      null,
      2
    )
  );
  const [executing, setExecuting] = useState<boolean>(false);
  const [execResult, setExecResult] = useState<any>(null);

  const sampleToolPayloads: Record<string, any> = {
    plan_comprehensive_journey: {
      fromLocation: 'Little India MRT',
      toLocation: 'Suntec City',
      mode: 'PUBLIC_TRANSPORT',
    },
    get_bus_arrival: {
      busStopCode: '83139',
      format: 'detailed',
    },
    search_location: {
      query: 'Marina Bay Sands',
    },
    resolve_postal_code: {
      postalCode: '039594',
    },
    get_train_service_status: {
      line: 'DTL',
    },
    get_weather_conditions: {
      location: 'Singapore Central',
    },
    get_weather_advisory: {
      activity: 'walking',
    },
    find_bus_stops: {
      query: 'Tampines',
    },
    get_bus_stop_details: {
      busStopCode: '83139',
    },
    get_nearby_taxis: {},
  };

  const handleToolChange = (toolName: string) => {
    setSelectedTool(toolName);
    const sample = sampleToolPayloads[toolName] || {};
    setToolArgsJson(JSON.stringify(sample, null, 2));
  };

  const handleExecuteTool = async () => {
    setExecuting(true);
    setExecResult(null);

    let parsedArgs = {};
    try {
      parsedArgs = JSON.parse(toolArgsJson);
    } catch (e: any) {
      setExecResult({ error: `Invalid JSON input: ${e.message}` });
      setExecuting(false);
      return;
    }

    try {
      const res = await fetch('/api/mcp/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolName: selectedTool,
          args: parsedArgs,
        }),
      });

      const data = await res.json();
      setExecResult(data);
    } catch (e: any) {
      setExecResult({ error: e.message });
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Overview Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center font-bold">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  {serverInfo?.name || 'siva-sub/MCP-Public-Transport'}
                </h2>
                <span className="text-xs bg-indigo-100 text-indigo-800 font-mono px-2 py-0.5 rounded font-semibold">
                  v{serverInfo?.version || '0.3.0'}
                </span>
                <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Connected
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                Official Model Context Protocol (MCP) server for Singapore public transport data, multi-modal routing, live bus arrivals, and weather-aware travel strategy.
              </p>
            </div>
          </div>

          <a
            href="https://github.com/siva-sub/MCP-Public-Transport"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shrink-0 shadow-xs"
          >
            <span>GitHub Repository</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Guardrail Policy Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-slate-800">Strict Read-Only Operations</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                No purchase, booking, or data modification operations permitted.
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-slate-800">Process Token Isolation</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                ONEMAP_TOKEN and LTA keys kept strictly server-side in memory.
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-start gap-2.5">
            <Layers className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-slate-800">MCP Protocol Compliance</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                All 13 official tools registered with JSON-RPC compliant schemas.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Tool Playground */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tool Selector & Input */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-700" />
              <span>Direct MCP Tool Execution Console</span>
            </h3>
            <span className="text-xs font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-semibold">
              Client ↔ Server JSON-RPC
            </span>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Select Official MCP Tool:
            </label>
            <select
              value={selectedTool}
              onChange={(e) => handleToolChange(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-900 font-mono focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {serverInfo?.supportedTools?.map((t: any) => (
                <option key={t.name} value={t.name}>
                  {t.name}
                </option>
              )) || (
                <>
                  <option value="plan_comprehensive_journey">plan_comprehensive_journey</option>
                  <option value="get_bus_arrival">get_bus_arrival</option>
                  <option value="search_location">search_location</option>
                  <option value="resolve_postal_code">resolve_postal_code</option>
                  <option value="get_train_service_status">get_train_service_status</option>
                  <option value="get_weather_conditions">get_weather_conditions</option>
                  <option value="get_weather_advisory">get_weather_advisory</option>
                  <option value="find_bus_stops">find_bus_stops</option>
                  <option value="get_bus_stop_details">get_bus_stop_details</option>
                  <option value="get_nearby_taxis">get_nearby_taxis</option>
                </>
              )}
            </select>
            <p className="text-[11px] text-slate-500 mt-1 italic">
              {serverInfo?.supportedTools?.find((t: any) => t.name === selectedTool)?.description}
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Tool Input Arguments (JSON):
            </label>
            <textarea
              rows={8}
              value={toolArgsJson}
              onChange={(e) => setToolArgsJson(e.target.value)}
              className="w-full p-3 font-mono text-xs bg-slate-950 text-slate-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <button
            onClick={handleExecuteTool}
            disabled={executing}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
          >
            {executing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Invoking MCP Tool...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Execute Official Tool</span>
              </>
            )}
          </button>
        </div>

        {/* Live Execution Output */}
        <div className="bg-slate-950 text-slate-200 border border-slate-800 rounded-xl p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-xs text-white">Tool Invocation Response</span>
            </div>
            {execResult && (
              <span className="text-[11px] font-mono text-slate-400">
                Duration: <strong className="text-emerald-400">{execResult.durationMs ?? 0}ms</strong>
              </span>
            )}
          </div>

          <div className="flex-1 overflow-auto max-h-[460px]">
            {execResult ? (
              <pre className="font-mono text-[11px] text-emerald-300 whitespace-pre-wrap leading-relaxed">
                {JSON.stringify(execResult, null, 2)}
              </pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs py-12 space-y-2">
                <Code2 className="w-8 h-8 text-slate-700" />
                <p>Click "Execute Official Tool" to invoke the tool live on Singapore data.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
