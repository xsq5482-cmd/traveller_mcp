export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationResult {
  id: string;
  name: string;
  displayName: string;
  address: string;
  postalCode?: string;
  building?: string;
  road?: string;
  latitude: number;
  longitude: number;
  confidence?: number;
  type?: 'mrt' | 'bus_stop' | 'landmark' | 'building' | 'address';
}

export interface WeatherConditions {
  location: string;
  nearestStation: string;
  temperature: number;
  rainfall: number; // mm
  humidity: number; // %
  windSpeed: number; // knots or km/h
  comfortLevel: 'Optimal' | 'Comfortable' | 'Warm & Humid' | 'High Heat / Rain Impact';
  walkingRating: 'Excellent' | 'Good' | 'Fair' | 'Poor (Heavy Rain)';
  twoHourForecast: string;
  forecastArea: string;
  travelAdvisory: string;
  timestamp: string;
}

export interface WeatherAdvisory {
  activity: string;
  suitability: 'High' | 'Moderate' | 'Low' | 'Not Recommended';
  recommendation: string;
  precautions: string[];
  rainfallDetected: boolean;
  temperatureNotice: string;
}

export interface TrainLineStatus {
  code: 'EWL' | 'NSL' | 'CCL' | 'DTL' | 'NEL' | 'TEL' | 'BPL' | 'SLRT' | 'PLRT';
  name: string;
  status: 'Normal Service' | 'Minor Delay' | 'Disrupted' | 'Track Maintenance';
  color: string;
  lastUpdated: string;
  message?: string;
}

export interface BusArrivalItem {
  serviceNo: string;
  operator: string;
  nextBus: {
    estimatedArrival: string;
    durationMinutes: number;
    load: 'Seats Available' | 'Standing Available' | 'Limited Standing';
    loadCode: 'SEA' | 'SDA' | 'LSD';
    feature: 'WAB' | 'Non-WAB'; // Wheelchair accessible
    type: 'Single Deck' | 'Double Deck' | 'Bendy';
  };
  nextBus2?: {
    durationMinutes: number;
    load: 'Seats Available' | 'Standing Available' | 'Limited Standing';
  };
  nextBus3?: {
    durationMinutes: number;
    load: 'Seats Available' | 'Standing Available' | 'Limited Standing';
  };
}

export interface BusStopArrivalResult {
  busStopCode: string;
  description: string;
  roadName: string;
  services: BusArrivalItem[];
  timestamp: string;
}

export interface JourneyStep {
  step: number;
  mode: 'WALK' | 'MRT' | 'BUS' | 'LRT';
  instruction: string;
  detail?: string;
  distanceMeters?: number;
  durationMinutes: number;
  line?: string;
  lineCode?: string;
  lineColor?: string;
  fromStationOrStop?: string;
  toStationOrStop?: string;
  numStops?: number;
  exitCode?: string; // e.g. "Use Exit E (14m walk, 1 min)"
  isCoveredWalkway?: boolean;
  weatherAlert?: string;
}

export interface ComprehensiveJourneyResult {
  success: boolean;
  summary: {
    totalDurationMinutes: number;
    walkingDurationMinutes: number;
    transitDurationMinutes: number;
    transfers: number;
    fareEstSGD: string;
    weatherAdjusted: boolean;
    weatherBufferMinutes: number;
    peakHourStatus: string;
  };
  origin: {
    name: string;
    address: string;
    postalCode?: string;
    latitude: number;
    longitude: number;
  };
  destination: {
    name: string;
    address: string;
    postalCode?: string;
    latitude: number;
    longitude: number;
  };
  steps: JourneyStep[];
  weatherImpact: {
    rainfallMm: number;
    conditions: string;
    walkingImpact: string;
    advisory: string;
    prefersCoveredWalkways: boolean;
  };
  advisories: string[];
  mcpMeta: {
    toolName: 'plan_comprehensive_journey';
    serverName: 'siva-sub/MCP-Public-Transport';
    version: '0.3.0';
    executionMs: number;
    apiCalls: number;
  };
}

export interface MCPToolExecutionLog {
  id: string;
  toolName: string;
  timestamp: string;
  durationMs: number;
  input: Record<string, any>;
  outputSummary: string;
  rawOutput?: any;
  status: 'success' | 'error';
}

export interface AgentChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  structuredPlan?: ComprehensiveJourneyResult;
  toolExecutions?: MCPToolExecutionLog[];
  validatedLocations?: {
    origin?: LocationResult;
    destination?: LocationResult;
  };
  realTimeAdvisories?: {
    busArrivals?: BusStopArrivalResult[];
    trainLines?: TrainLineStatus[];
    weather?: WeatherConditions;
  };
}
