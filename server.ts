import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { mcpBridge } from './src/server/mcpServer.js';
import { runMobilityStrategistAgent } from './src/server/agentWorkflow.js';
import mcpHandler from './api/mcp.js';

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());

// Register Streamable HTTP MCP Server at /api/mcp
app.post('/api/mcp', mcpHandler);
app.get('/api/mcp', mcpHandler);

// Initialize official MCP Server Bridge
mcpBridge.init().catch(console.error);

// API Endpoints for Singapore MCP & AI Agent

// 1. MCP Server Metadata & Catalog
app.get('/api/mcp/info', (req: Request, res: Response) => {
  try {
    const info = mcpBridge.getServerInfo();
    res.json(info);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Direct MCP Tool Execution (Enforces Read-Only & Official Tools)
app.post('/api/mcp/execute', async (req: Request, res: Response) => {
  const { toolName, args } = req.body;
  if (!toolName) {
    return res.status(400).json({ error: 'toolName is required' });
  }

  const startTime = Date.now();
  try {
    const result = await mcpBridge.executeTool(toolName, args || {});
    res.json({
      success: true,
      toolName,
      durationMs: Date.now() - startTime,
      result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      toolName,
      durationMs: Date.now() - startTime,
      error: error.message,
    });
  }
});

// 3. AI Agent Travel Strategist Query
app.post('/api/agent/query', async (req: Request, res: Response) => {
  const { message } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'message string is required' });
  }

  try {
    const agentResponse = await runMobilityStrategistAgent(message);
    res.json(agentResponse);
  } catch (error: any) {
    console.error('Agent query error:', error);
    res.status(500).json({ error: error.message || 'Internal agent execution error' });
  }
});

// 4. Live Weather & Rainfall Feed
app.get('/api/live/weather', async (req: Request, res: Response) => {
  try {
    const weather = await mcpBridge.getWeatherConditions();
    res.json(weather);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Live Train Status Feed
app.get('/api/live/trains', async (req: Request, res: Response) => {
  try {
    const status = await mcpBridge.getTrainServiceStatus();
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Live Bus Arrival Feed
app.get('/api/live/bus-arrival', async (req: Request, res: Response) => {
  const code = (req.query.busStopCode as string) || '83139';
  const serviceNo = req.query.serviceNo as string | undefined;
  try {
    const arrival = await mcpBridge.getBusArrival(code, serviceNo);
    res.json(arrival);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Mount Vite in middleware mode during development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve pre-built static files in production
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`🚆 Singapore AI Transit Strategist running on http://0.0.0.0:${port}`);
  });
}

startServer().catch(err => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
