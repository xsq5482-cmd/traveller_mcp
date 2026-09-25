/**
 * Shared Upstream Transit and Weather API Clients
 * Never returns mock, seed, or fallback data.
 * Adheres strictly to read-only calls and process.env credential isolation.
 */

/**
 * Search locations via Singapore OneMap search API
 * @param {string} query
 */
export async function searchLocationUpstream(query) {
  const url = new URL('https://www.onemap.gov.sg/api/common/elastic/search');
  url.searchParams.set('searchVal', query);
  url.searchParams.set('returnGeom', 'Y');
  url.searchParams.set('getAddrDetails', 'Y');
  url.searchParams.set('pageNum', '1');

  const headers = {};
  const token = process.env.ONEMAP_API_TOKEN || process.env.ONEMAP_TOKEN;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url.toString(), {
    headers,
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`OneMap search upstream request failed with status ${response.status}`);
  }

  const data = await response.json();
  const rawResults = data.results || [];

  const items = rawResults.slice(0, 20).map((r) => ({
    name: r.BUILDING && r.BUILDING !== 'NIL' ? r.BUILDING : r.SEARCHVAL,
    address: r.ADDRESS,
    postal_code: r.POSTAL && r.POSTAL !== 'NIL' ? r.POSTAL : null,
    road_name: r.ROAD_NAME && r.ROAD_NAME !== 'NIL' ? r.ROAD_NAME : null,
    building: r.BUILDING && r.BUILDING !== 'NIL' ? r.BUILDING : null,
    latitude: parseFloat(r.LATITUDE),
    longitude: parseFloat(r.LONGITUDE),
  }));

  return {
    query,
    count: items.length,
    items,
    source: 'Singapore OneMap Search API',
    fetched_at: new Date().toISOString(),
  };
}

/**
 * Get Singapore 2-hour weather forecast via data.gov.sg NEA API
 * @param {string} [area]
 */
export async function getWeatherForecastUpstream(area) {
  const url = 'https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast';

  const response = await fetch(url, {
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`NEA two-hour weather forecast upstream request failed with status ${response.status}`);
  }

  const json = await response.json();
  const item = json.data?.items?.[0];
  if (!item) {
    throw new Error('NEA two-hour weather forecast upstream request failed with status 204: no forecast items available');
  }

  let forecasts = item.forecasts || [];
  if (area) {
    const areaLower = area.trim().toLowerCase();
    forecasts = forecasts.filter((f) => f.area.toLowerCase().includes(areaLower));
  }

  const items = forecasts.slice(0, 20).map((f) => ({
    area: f.area,
    forecast: f.forecast,
  }));

  return {
    valid_period: item.valid_period,
    count: items.length,
    items,
    source: 'data.gov.sg NEA Two-Hour Forecast API',
    fetched_at: new Date().toISOString(),
  };
}

/**
 * Get Singapore rainfall readings via data.gov.sg NEA API
 */
export async function getRainfallReadingsUpstream() {
  const url = 'https://api-open.data.gov.sg/v2/real-time/api/rainfall';

  const response = await fetch(url, {
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`NEA rainfall upstream request failed with status ${response.status}`);
  }

  const json = await response.json();
  const stations = json.data?.stations || [];
  const readings = json.data?.readings?.[0]?.data || [];

  const stationMap = new Map();
  for (const s of stations) {
    stationMap.set(s.id, {
      name: s.name,
      location: s.location,
    });
  }

  const items = readings.slice(0, 20).map((r) => {
    const sId = r.stationId || r.station_id;
    const sInfo = stationMap.get(sId);
    return {
      station_id: sId,
      station_name: sInfo?.name || sId,
      rainfall_mm: Number(r.value),
      location: sInfo?.location || null,
    };
  });

  return {
    count: items.length,
    items,
    source: 'data.gov.sg NEA Rainfall API',
    fetched_at: new Date().toISOString(),
  };
}

/**
 * Get Singapore air temperature readings via data.gov.sg NEA API
 */
export async function getAirTemperatureUpstream() {
  const url = 'https://api-open.data.gov.sg/v2/real-time/api/air-temperature';

  const response = await fetch(url, {
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`NEA air temperature upstream request failed with status ${response.status}`);
  }

  const json = await response.json();
  const stations = json.data?.stations || [];
  const readings = json.data?.readings?.[0]?.data || [];

  const stationMap = new Map();
  for (const s of stations) {
    stationMap.set(s.id, {
      name: s.name,
      location: s.location,
    });
  }

  const items = readings.slice(0, 20).map((r) => {
    const sId = r.stationId || r.station_id;
    const sInfo = stationMap.get(sId);
    return {
      station_id: sId,
      station_name: sInfo?.name || sId,
      temperature_celsius: Number(r.value),
      location: sInfo?.location || null,
    };
  });

  return {
    count: items.length,
    items,
    source: 'data.gov.sg NEA Air Temperature API',
    fetched_at: new Date().toISOString(),
  };
}

/**
 * Get Singapore bus arrival times via LTA DataMall BusArrivalv2 API
 * @param {string} busStopCode
 * @param {string} [serviceNo]
 */
export async function getBusArrivalUpstream(busStopCode, serviceNo) {
  const accountKey = process.env.LTA_ACCOUNT_KEY;
  if (!accountKey) {
    throw new Error('LTA DataMall bus arrival upstream request failed with status 401: LTA_ACCOUNT_KEY is not configured');
  }

  const url = new URL('https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival');
  url.searchParams.set('BusStopCode', busStopCode);
  if (serviceNo) {
    url.searchParams.set('ServiceNo', serviceNo);
  }

  const response = await fetch(url.toString(), {
    headers: {
      AccountKey: accountKey,
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`LTA DataMall bus arrival upstream request failed with status ${response.status}`);
  }

  const json = await response.json();
  const services = json.Services || [];

  const items = services.slice(0, 20).map((s) => ({
    service_no: s.ServiceNo,
    operator: s.Operator,
    next_bus: s.NextBus ? {
      estimated_arrival: s.NextBus.EstimatedArrival,
      latitude: s.NextBus.Latitude,
      longitude: s.NextBus.Longitude,
      load: s.NextBus.Load,
      feature: s.NextBus.Feature,
      type: s.NextBus.Type,
    } : null,
    next_bus_2: s.NextBus2 ? {
      estimated_arrival: s.NextBus2.EstimatedArrival,
      load: s.NextBus2.Load,
      type: s.NextBus2.Type,
    } : null,
    next_bus_3: s.NextBus3 ? {
      estimated_arrival: s.NextBus3.EstimatedArrival,
      load: s.NextBus3.Load,
      type: s.NextBus3.Type,
    } : null,
  }));

  return {
    bus_stop_code: json.BusStopCode || busStopCode,
    count: items.length,
    items,
    source: 'LTA DataMall BusArrivalv2 API',
    fetched_at: new Date().toISOString(),
  };
}

/**
 * Get Singapore train service alerts via LTA DataMall TrainServiceAlerts API
 * @param {string} [lineCode]
 */
export async function getTrainServiceAlertsUpstream(lineCode) {
  const accountKey = process.env.LTA_ACCOUNT_KEY;
  if (!accountKey) {
    throw new Error('LTA DataMall train alert upstream request failed with status 401: LTA_ACCOUNT_KEY is not configured');
  }

  const url = 'https://datamall2.mytransport.sg/ltaodataservice/TrainServiceAlerts';

  const response = await fetch(url, {
    headers: {
      AccountKey: accountKey,
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`LTA DataMall train alert upstream request failed with status ${response.status}`);
  }

  const json = await response.json();
  const status = json.value?.Status; // 1 = Normal, 2 = Disrupted
  const affectedSegments = json.value?.AffectedSegments || [];

  let items = affectedSegments;
  if (lineCode) {
    const lUpper = lineCode.trim().toUpperCase();
    items = items.filter((seg) => seg.Line?.toUpperCase() === lUpper);
  }

  return {
    status: status === 2 ? 'Disrupted' : 'Normal',
    message: json.value?.Message || null,
    count: items.slice(0, 20).length,
    items: items.slice(0, 20),
    source: 'LTA DataMall TrainServiceAlerts API',
    fetched_at: new Date().toISOString(),
  };
}
