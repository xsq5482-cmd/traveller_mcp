import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import {
  searchLocationUpstream,
  getWeatherForecastUpstream,
  getRainfallReadingsUpstream,
  getAirTemperatureUpstream,
  getBusArrivalUpstream,
  getTrainServiceAlertsUpstream,
} from '../lib/transitUpstream.js';

/**
 * MCP Server Handler at /api/mcp
 * Serves Gemini SDK mcpToTool over Streamable HTTP (protocol 2025-11-25)
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({
      jsonrpc: '2.0',
      error: { code: -32000, message: 'Method not allowed' },
      id: null,
    });
    return;
  }

  // Build fresh server and transport for each request - no stored sessions
  const server = new McpServer({
    name: 't3-server',
    version: '1.0.0',
  });

  // Tool 1: t3_search_location
  server.registerTool(
    't3_search_location',
    {
      description:
        'Returns matching Singapore addresses, postal codes, buildings, and geographic coordinates for a search query. Data is read from the official Singapore OneMap search upstream API. Use this tool when an agent needs to locate an address, validate a postal code, or find coordinates for travel origins and destinations in Singapore. It does not provide public transit routing directions or bus arrival timings.',
      inputSchema: z.object({
        query: z
          .string()
          .min(1)
          .describe('Search query for a Singapore address, landmark, building name, road, or 6-digit postal code'),
      }),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const result = await searchLocationUpstream(args.query);
        return {
          content: [{ type: 'text', text: JSON.stringify(result) }],
        };
      } catch (err) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: err.message || 'OneMap search upstream request failed with status 500.',
            },
          ],
        };
      }
    }
  );

  // Tool 2: t3_get_weather_forecast
  server.registerTool(
    't3_get_weather_forecast',
    {
      description:
        'Returns real-time two-hour weather forecasts across Singapore planning areas. Data is read from the National Environment Agency two-hour weather forecast upstream API via data.gov.sg. Use this tool when assessing current rain conditions, thunderstorm risks, or walking comfort for Singapore commuters. It does not provide historical weather records or long-term multi-day weather predictions.',
      inputSchema: z.object({
        area: z
          .string()
          .optional()
          .describe('Optional Singapore planning area name to filter, such as City, Orchard, Bedok, or Jurong East'),
      }),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const result = await getWeatherForecastUpstream(args.area);
        return {
          content: [{ type: 'text', text: JSON.stringify(result) }],
        };
      } catch (err) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: err.message || 'NEA two-hour weather forecast upstream request failed with status 500.',
            },
          ],
        };
      }
    }
  );

  // Tool 3: t3_get_rainfall_readings
  server.registerTool(
    't3_get_rainfall_readings',
    {
      description:
        'Returns live precipitation readings in millimeters from automated weather monitoring stations across Singapore. Data is read from the National Environment Agency rainfall upstream API on data.gov.sg. Use this tool to monitor active rainfall intensity and identify rain bottlenecks along pedestrian corridors. It does not provide air temperature measurements or future rain forecasts.',
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async () => {
      try {
        const result = await getRainfallReadingsUpstream();
        return {
          content: [{ type: 'text', text: JSON.stringify(result) }],
        };
      } catch (err) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: err.message || 'NEA rainfall upstream request failed with status 500.',
            },
          ],
        };
      }
    }
  );

  // Tool 4: t3_get_air_temperature
  server.registerTool(
    't3_get_air_temperature',
    {
      description:
        'Returns current ambient air temperature readings in degrees Celsius across monitoring stations throughout Singapore. Data is read from the National Environment Agency air temperature upstream API on data.gov.sg. Use this tool to evaluate outdoor thermal comfort and heat levels for travelers walking between transit stops. It does not measure relative humidity percentages or indoor building temperatures.',
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async () => {
      try {
        const result = await getAirTemperatureUpstream();
        return {
          content: [{ type: 'text', text: JSON.stringify(result) }],
        };
      } catch (err) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: err.message || 'NEA air temperature upstream request failed with status 500.',
            },
          ],
        };
      }
    }
  );

  // Tool 5: t3_get_bus_arrival
  server.registerTool(
    't3_get_bus_arrival',
    {
      description:
        'Returns estimated arrival countdowns, vehicle types, and passenger crowding load levels for buses serving a specified Singapore bus stop. Data is read from the Land Transport Authority DataMall Bus Arrival v2 upstream API. Use this tool when planning bus connections and checking if approaching buses have available seating or standing room. It does not reserve bus seats or process electronic transit fare card payments.',
      inputSchema: z.object({
        bus_stop_code: z
          .string()
          .min(1)
          .describe('5-digit Singapore bus stop code, such as 83139, 01012, or 03071'),
        service_no: z
          .string()
          .optional()
          .describe('Optional bus service number to filter, such as 15, 36, or 106'),
      }),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const result = await getBusArrivalUpstream(args.bus_stop_code, args.service_no);
        return {
          content: [{ type: 'text', text: JSON.stringify(result) }],
        };
      } catch (err) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: err.message || 'LTA DataMall bus arrival upstream request failed with status 500.',
            },
          ],
        };
      }
    }
  );

  // Tool 6: t3_get_train_service_alerts
  server.registerTool(
    't3_get_train_service_alerts',
    {
      description:
        'Returns active train service alerts, delays, and operating statuses across Singapore MRT and LRT lines. Data is read from the Land Transport Authority DataMall Train Service Alerts upstream API. Use this tool to check for operational disruptions along rail corridors before recommending train routes to commuters. It does not display train carriage seating availability or exact train GPS coordinates.',
      inputSchema: z.object({
        line_code: z
          .string()
          .optional()
          .describe('Optional train line code to filter, such as NSL, EWL, CCL, DTL, NEL, or TEL'),
      }),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const result = await getTrainServiceAlertsUpstream(args.line_code);
        return {
          content: [{ type: 'text', text: JSON.stringify(result) }],
        };
      } catch (err) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: err.message || 'LTA DataMall train alert upstream request failed with status 500.',
            },
          ],
        };
      }
    }
  );

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  res.on('close', async () => {
    try {
      await transport.close();
    } catch {}
    try {
      await server.close();
    } catch {}
  });

  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
}
