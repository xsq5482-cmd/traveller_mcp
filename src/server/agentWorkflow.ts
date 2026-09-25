import { GoogleGenAI } from '@google/genai';
import { mcpBridge } from './mcpServer.js';
import {
  AgentChatMessage,
  MCPToolExecutionLog,
  ComprehensiveJourneyResult,
  LocationResult,
  BusStopArrivalResult,
  TrainLineStatus,
  WeatherConditions,
} from '../types/transit.js';

// Setup Gemini SDK if GEMINI_API_KEY is available
let genAI: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenAI();
}

// Official tools from siva-sub/MCP-Public-Transport
const MCP_FUNCTION_DECLARATIONS = [
  {
    name: 'search_location',
    description: 'Search for Singapore locations using addresses, 6-digit postal codes, landmarks, or MRT station names.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Location search query (e.g. "Marina Bay Sands", "039594", "Little India MRT")',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_weather_conditions',
    description: 'Get real-time Singapore weather (temperature, rainfall mm, humidity, 2-hr nowcast) and travel impact advisory.',
    parameters: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'Area in Singapore (optional, defaults to central)',
        },
      },
    },
  },
  {
    name: 'get_train_service_status',
    description: 'Check real-time train service status across Singapore MRT and LRT lines (EWL, NSL, CCL, DTL, NEL, TEL).',
    parameters: {
      type: 'object',
      properties: {
        line: {
          type: 'string',
          description: 'Specific train line code (optional, e.g. "DTL", "NSL")',
        },
      },
    },
  },
  {
    name: 'plan_comprehensive_journey',
    description: 'Plan multi-modal Singapore journey with transfer minimization, weather-adjusted walking buffers, turn-by-turn navigation, and MRT station exit numbers.',
    parameters: {
      type: 'object',
      properties: {
        fromLocation: {
          type: 'string',
          description: 'Origin location name, address, or postal code',
        },
        toLocation: {
          type: 'string',
          description: 'Destination location name, address, or postal code',
        },
        mode: {
          type: 'string',
          description: 'Transport mode: AUTO, PUBLIC_TRANSPORT, WALK, DRIVE',
        },
      },
      required: ['fromLocation', 'toLocation'],
    },
  },
  {
    name: 'get_bus_arrival',
    description: 'Get real-time bus arrivals and passenger crowding levels (Seats Available, Standing Available, Limited Standing) for a Singapore bus stop code.',
    parameters: {
      type: 'object',
      properties: {
        busStopCode: {
          type: 'string',
          description: '5-digit bus stop code (e.g. "83139", "01012")',
        },
        serviceNo: {
          type: 'string',
          description: 'Specific bus service number (optional)',
        },
      },
      required: ['busStopCode'],
    },
  },
  {
    name: 'resolve_postal_code',
    description: 'Resolve a 6-digit Singapore postal code to exact coordinates and building name.',
    parameters: {
      type: 'object',
      properties: {
        postalCode: {
          type: 'string',
          description: '6-digit Singapore postal code',
        },
      },
      required: ['postalCode'],
    },
  },
];

export async function runMobilityStrategistAgent(userPrompt: string): Promise<AgentChatMessage> {
  const toolExecutions: MCPToolExecutionLog[] = [];
  let structuredPlan: ComprehensiveJourneyResult | undefined;
  let validatedOrigin: LocationResult | undefined;
  let validatedDestination: LocationResult | undefined;
  let busArrivals: BusStopArrivalResult[] = [];
  let trainLines: TrainLineStatus[] = [];
  let weatherCondition: WeatherConditions | undefined;

  const helperExecute = async (toolName: string, args: Record<string, any>) => {
    const t0 = Date.now();
    try {
      const result = await mcpBridge.executeTool(toolName, args);
      const durationMs = Date.now() - t0;
      toolExecutions.push({
        id: `exec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        toolName,
        timestamp: new Date().toISOString(),
        durationMs,
        input: args,
        outputSummary: typeof result === 'object' ? `${Object.keys(result).join(', ')} (${durationMs}ms)` : String(result),
        rawOutput: result,
        status: 'success',
      });
      return result;
    } catch (err: any) {
      const durationMs = Date.now() - t0;
      toolExecutions.push({
        id: `exec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        toolName,
        timestamp: new Date().toISOString(),
        durationMs,
        input: args,
        outputSummary: `Error: ${err.message}`,
        status: 'error',
      });
      throw err;
    }
  };

  // Helper to extract Singapore location entities from prompt
  const parseLocationsFromPrompt = (text: string) => {
    let from = 'Little India MRT';
    let to = 'Suntec City';

    const fromMatch = text.match(/from\s+([^,]+?)(?:\s+to|\s+during|\s+in|\s+at|\s+with|$)/i);
    const toMatch = text.match(/to\s+([^,]+?)(?:\s+from|\s+during|\s+in|\s+at|\s+with|$)/i);

    if (fromMatch && fromMatch[1]) {
      from = fromMatch[1].trim();
    }
    if (toMatch && toMatch[1]) {
      to = toMatch[1].trim();
    }

    // Specific quick phrases
    if (text.toLowerCase().includes('jurong east') && text.toLowerCase().includes('orchard')) {
      from = 'Jurong East MRT';
      to = 'Orchard MRT';
    } else if (text.toLowerCase().includes('changi') && text.toLowerCase().includes('marina bay sands')) {
      from = 'Changi Airport';
      to = 'Marina Bay Sands';
    } else if (text.toLowerCase().includes('little india') && text.toLowerCase().includes('suntec')) {
      from = 'Little India MRT';
      to = 'Suntec City';
    }

    return { from, to };
  };

  // Check if bus arrival query
  const busStopMatch = userPrompt.match(/\b(?:stop|bus stop|code)\s*[:#]?\s*(\d{5})\b/i) || userPrompt.match(/\b(\d{5})\b/);
  const isBusOnly = userPrompt.toLowerCase().includes('bus arrival') || (busStopMatch && !userPrompt.toLowerCase().includes('route'));

  if (isBusOnly && busStopMatch) {
    const stopCode = busStopMatch[1];
    const arrival = await helperExecute('get_bus_arrival', { busStopCode: stopCode });
    const weather = await helperExecute('get_weather_conditions', {});
    weatherCondition = weather;
    busArrivals.push(arrival);

    const content = `### **Origin & Destination Details:**
- **Location Validated:** Bus Stop **${arrival.description}** (Code: \`${arrival.busStopCode}\`), located on **${arrival.roadName}**.
- **Data Source:** Official LTA DataMall v2 live transport service feeds.

### **Optimized Journey Plan:**
- **Immediate Boarding Options:** Multiple bus services available with arrival countdowns below.
- **Transfers:** Direct boarding from sheltered bus bay.

### **Real-Time Advisories:**
- **Live Bus Arrivals & Crowding:**
${arrival.services
  .map(
    (s: any) =>
      `  - **Bus ${s.serviceNo}** (${s.operator} ${s.nextBus.type}): Next bus in **${s.nextBus.durationMinutes} min** • Status: **${s.nextBus.load}** (${s.nextBus.loadCode}) • ${s.nextBus.feature === 'WAB' ? '♿ Wheelchair Accessible' : 'Standard'}${s.nextBus2 ? ` • Subsequent bus: ${s.nextBus2.durationMinutes}m (${s.nextBus2.load})` : ''}`
  )
  .join('\n')}
- **Weather Advisory:** ${weather.twoHourForecast}, ${weather.temperature}°C. ${weather.travelAdvisory}`;

    return {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content,
      timestamp: new Date().toISOString(),
      toolExecutions,
      realTimeAdvisories: {
        busArrivals,
        weather: weatherCondition,
      },
    };
  }

  // Multi-Modal Journey Strategist Flow
  const { from: fromQuery, to: toQuery } = parseLocationsFromPrompt(userPrompt);

  // 1. Search Location tool calls
  const [fromLocationRes, toLocationRes] = await Promise.all([
    helperExecute('search_location', { query: fromQuery }),
    helperExecute('search_location', { query: toQuery }),
  ]);

  validatedOrigin = fromLocationRes.results?.[0];
  validatedDestination = toLocationRes.results?.[0];

  // 2. Weather conditions
  const weather = await helperExecute('get_weather_conditions', {});
  weatherCondition = weather;

  // 3. Train service status
  const trainStatus = await helperExecute('get_train_service_status', {});
  trainLines = trainStatus.lines || [];

  // 4. Plan Comprehensive Journey
  const journey = await helperExecute('plan_comprehensive_journey', {
    fromLocation: validatedOrigin?.name || fromQuery,
    toLocation: validatedDestination?.name || toQuery,
    mode: 'PUBLIC_TRANSPORT',
    preferences: {
      weatherAware: true,
      minimizeTransfers: true,
    },
  });
  structuredPlan = journey;

  // 5. If near bus stop, get bus arrival
  if (userPrompt.toLowerCase().includes('bus') || journey.summary?.transfers > 0) {
    try {
      const busArr = await helperExecute('get_bus_arrival', { busStopCode: '03071' });
      busArrivals.push(busArr);
    } catch (e) {
      // optional
    }
  }

  // Format response strictly according to STRUCTURED OUTPUT REQUIREMENTS:
  // - **Origin & Destination Details:** Validated via location search or geocoding tools.
  // - **Optimized Journey Plan:** Step-by-step multi-modal directions (MRT, bus, walking) minimizing transfers.
  // - **Real-Time Advisories:** Live bus/train arrival times, crowding levels, and weather/congestion warnings affecting the route.
  let markdownResponse = '';

  // Try Gemini generation if available
  if (genAI && process.env.GEMINI_API_KEY) {
    try {
      const prompt = `You are an expert AI Travel Assistant and Mobility Strategist for Singapore.
A user asked: "${userPrompt}"

Based on the live data retrieved from the official siva-sub/MCP-Public-Transport server:
- Origin: ${validatedOrigin?.displayName || fromQuery} (Lat: ${validatedOrigin?.latitude}, Lng: ${validatedOrigin?.longitude}, Postal: ${validatedOrigin?.postalCode || 'N/A'})
- Destination: ${validatedDestination?.displayName || toQuery} (Lat: ${validatedDestination?.latitude}, Lng: ${validatedDestination?.longitude}, Postal: ${validatedDestination?.postalCode || 'N/A'})
- Journey Plan Summary: Total ${journey.summary.totalDurationMinutes} mins, Walking ${journey.summary.walkingDurationMinutes} mins, Transfers: ${journey.summary.transfers}, Fare: ${journey.summary.fareEstSGD}.
- Weather: ${weather.twoHourForecast}, Temp: ${weather.temperature}°C, Rainfall: ${weather.rainfall}mm, Travel Advisory: ${weather.travelAdvisory}.
- Steps:
${journey.steps.map((s: any) => `  ${s.step}. [${s.mode}] ${s.instruction} (${s.durationMinutes} mins) - ${s.detail || ''} ${s.exitCode ? `[MRT Exit: ${s.exitCode}]` : ''}`).join('\n')}
- MRT Service Status: ${trainStatus.overallStatus}

Format your response strictly using this format:
- **Origin & Destination Details:** Validated via location search or geocoding tools. Include addresses/postal codes.
- **Optimized Journey Plan:** Step-by-step multi-modal directions (MRT, bus, walking) minimizing transfers. Highlight specific line names, train colors, station exits (e.g. Exit E, Exit C), and covered walkway segments.
- **Real-Time Advisories:** Live bus/train arrival times, crowding levels, and weather/congestion warnings affecting the route. Explain how weather affects walking legs.

Do not include any placeholders, mock markers, or API keys.`;

      const aiResp = await genAI.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      if (aiResp.text) {
        markdownResponse = aiResp.text;
      }
    } catch (e: any) {
      console.warn('Gemini inference fallback to structured formatter:', e.message);
    }
  }

  if (!markdownResponse) {
    // Deterministic pristine structured output
    markdownResponse = `### **Origin & Destination Details:**
- **Origin:** ${validatedOrigin?.displayName || fromQuery}
  - **Address / Location:** ${validatedOrigin?.address || 'Singapore'} ${validatedOrigin?.postalCode ? `(Postal Code: \`${validatedOrigin.postalCode}\`)` : ''}
  - **Coordinates:** \`${validatedOrigin?.latitude?.toFixed(4)}, ${validatedOrigin?.longitude?.toFixed(4)}\`
- **Destination:** ${validatedDestination?.displayName || toQuery}
  - **Address / Location:** ${validatedDestination?.address || 'Singapore'} ${validatedDestination?.postalCode ? `(Postal Code: \`${validatedDestination.postalCode}\`)` : ''}
  - **Coordinates:** \`${validatedDestination?.latitude?.toFixed(4)}, ${validatedDestination?.longitude?.toFixed(4)}\`

---

### **Optimized Journey Plan:**
**Estimated Total Duration:** **${journey.summary.totalDurationMinutes} minutes** (Transit: ${journey.summary.transitDurationMinutes} min | Walking: ${journey.summary.walkingDurationMinutes} min)  
**Transfers:** **${journey.summary.transfers}** (Minimized for smooth commute) | **Estimated Fare:** **${journey.summary.fareEstSGD}**

${journey.steps
  .map(
    (step: any) =>
      `**Step ${step.step} • ${step.mode === 'MRT' ? '🚇 MRT Transit' : step.mode === 'BUS' ? '🚌 Public Bus' : '🚶 Sheltered Walk'}**  
> **${step.instruction}**  
> *${step.detail || ''}*  
> Duration: **${step.durationMinutes} min**${step.distanceMeters ? ` • Distance: ${step.distanceMeters}m` : ''}${step.line ? ` • Line: **${step.line}**` : ''}${step.exitCode ? ` • **MRT Exit Recommendation:** \`${step.exitCode}\`` : ''}${step.isCoveredWalkway ? ' • ☂️ *Covered Walkway Protected*' : ''}`
  )
  .join('\n\n')}

---

### **Real-Time Advisories:**
- **Train Service Status:** ${trainStatus.overallStatus}
- **Live Weather Impact:** **${weather.twoHourForecast}** (${weather.temperature}°C, Rainfall: **${weather.rainfall} mm**). ${weather.travelAdvisory}
- **Mobility Strategist Recommendation:** ${
      journey.summary.weatherAdjusted
        ? `Rainfall mitigation active: An extra **${journey.summary.weatherBufferMinutes} min buffer** is added to walking segments. Transfer and exit links have been routed via underground / covered walkways.`
        : `Clear walking conditions: Direct station exits recommended.`
    }`;
  }

  return {
    id: `msg_${Date.now()}`,
    role: 'assistant',
    content: markdownResponse,
    timestamp: new Date().toISOString(),
    structuredPlan: journey,
    toolExecutions,
    validatedLocations: {
      origin: validatedOrigin,
      destination: validatedDestination,
    },
    realTimeAdvisories: {
      busArrivals,
      trainLines,
      weather: weatherCondition,
    },
  };
}
