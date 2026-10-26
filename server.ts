/**
 * Wayora Journeys - Red Edition
 * Production Server (Express + Node.js ESM)
 * 
 * Features:
 * - Production static asset serving with caching headers
 * - Client-side SPA routing fallback
 * - System health check endpoint (/api/health)
 * - Booking dispatch API (/api/bookings)
 * - Contact & inquiry API (/api/contact)
 * - Server-side Gemini AI Concierge (/api/ai/concierge)
 */

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { apiRouter } from './src/server/apiRouter';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

// Determine dist directory path (supports both development tsx and bundled dist/server.js)
const distPath = fs.existsSync(path.join(__dirname, 'dist'))
  ? path.join(__dirname, 'dist')
  : path.join(__dirname);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in development/production
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// ================= API ROUTES =================
app.use('/api', apiRouter);

/**
 * Health check endpoint for container orchestrators (Cloud Run, Kubernetes, Render, AWS ECS)
 */
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    service: 'Wayora Journeys - Red Edition',
    environment: process.env.NODE_ENV || 'production',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    memoryUsage: process.memoryUsage().rss
  });
});

/**
 * Booking dispatch endpoint
 */
app.post('/api/bookings', (req: Request, res: Response) => {
  try {
    const { 
      customerName, 
      customerPhone, 
      pickupLocation, 
      destination, 
      travelDate, 
      travelTime, 
      vehicleName,
      tripType,
      estimatedTotal 
    } = req.body;

    if (!customerName || !customerPhone || !pickupLocation || !destination) {
      return res.status(400).json({
        success: false,
        error: 'Missing mandatory booking details: customerName, customerPhone, pickupLocation, destination are required.'
      });
    }

    const bookingId = `WY-${Date.now().toString(36).toUpperCase()}`;

    console.log(`[DISPATCH] Booking created #${bookingId} for ${customerName} (${pickupLocation} -> ${destination})`);

    return res.status(201).json({
      success: true,
      bookingId,
      message: 'Chauffeur trip confirmed and dispatched to operations desk.',
      booking: {
        id: bookingId,
        customerName,
        customerPhone,
        pickupLocation,
        destination,
        travelDate: travelDate || 'Immediate',
        travelTime: travelTime || 'Now',
        vehicleName: vehicleName || 'Executive Chauffeur Fleet',
        tripType: tripType || 'ONE_WAY',
        estimatedTotal: estimatedTotal || null,
        status: 'CONFIRMED',
        createdAt: new Date().toISOString()
      }
    });
  } catch (err: any) {
    console.error('Error creating booking:', err);
    return res.status(500).json({ success: false, error: 'Internal dispatch error' });
  }
});

/**
 * Contact and partnership inquiry endpoint
 */
app.post('/api/contact', (req: Request, res: Response) => {
  const { name, email, phone, message, type } = req.body;

  if (!name || (!email && !phone)) {
    return res.status(400).json({
      success: false,
      error: 'Please provide your name and at least an email address or phone number.'
    });
  }

  const inquiryId = `INQ-${Date.now().toString(36).toUpperCase()}`;
  console.log(`[INQUIRY] New inquiry #${inquiryId} from ${name} (${type || 'general'})`);

  return res.status(200).json({
    success: true,
    inquiryId,
    message: 'Thank you for reaching out to Wayora Journeys. Our concierge will contact you shortly.'
  });
});

/**
 * Server-Side Gemini AI Concierge Endpoint
 * Safely invokes Gemini on the backend using server environment secrets.
 */
app.post('/api/ai/concierge', async (req: Request, res: Response) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return res.status(503).json({
        success: false,
        error: 'Gemini AI API key is not configured. Set GEMINI_API_KEY in server environment.'
      });
    }

    const { message, context } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Missing message parameter in request body.'
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const systemPrompt = `You are the Wayora Journeys Luxury Travel Concierge.
Wayora Journeys is an elite chauffeur-driven intercity car service operating outstation trips, airport transfers, and temple pilgrimage tours across India (Telangana, Andhra Pradesh, Maharashtra, Karnataka, Goa, etc.).
Your tone is professional, warm, and highly knowledgeable.
Help passengers with route recommendations, highway travel durations, luxury fleet choices (Jaguar XF, Innova Crysta, Mercedes E-Class, Fortuner VIP), and tour advice.
Keep responses concise, polite, and directly helpful.`;

    const fullPrompt = context 
      ? `User Context: ${JSON.stringify(context)}\n\nPassenger Question: ${message}`
      : message;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
      config: {
        systemInstruction: systemPrompt
      }
    });

    return res.status(200).json({
      success: true,
      reply: response.text
    });
  } catch (error: any) {
    console.error('Gemini Concierge API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Error processing AI concierge request.'
    });
  }
});

// ================= STATIC ASSETS & SPA ROUTING =================

// Static file serving with cache-control headers for production assets
app.use(express.static(distPath, {
  maxAge: '1d',
  immutable: false,
  index: false
}));

// SPA Fallback: Serve dist/index.html for any client navigation route
app.get('*', (req: Request, res: Response) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Application build files not found. Run `npm run build` first.');
  }
});

// Start Server
const server = app.listen(PORT, HOST, () => {
  console.log(`\n==================================================`);
  console.log(`✨ Wayora Journeys Production Server Active`);
  console.log(`🌐 URL: http://${HOST}:${PORT}`);
  console.log(`📂 Static Root: ${distPath}`);
  console.log(`🩺 Health Check: http://${HOST}:${PORT}/api/health`);
  console.log(`==================================================\n`);
});

// Graceful termination handling
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, closing server gracefully...');
  server.close(() => {
    console.log('Server terminated cleanly.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, closing server gracefully...');
  server.close(() => {
    console.log('Server terminated cleanly.');
    process.exit(0);
  });
});

export default app;
