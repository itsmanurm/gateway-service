import { Router } from 'express';
import axios from 'axios';
import axiosRetry from 'axios-retry';

const r = Router();

const AI_BASE_URL = process.env.AI_BASE_URL;
const AI_API_KEY  = process.env.AI_API_KEY;

if (!AI_BASE_URL || !AI_API_KEY) {
  throw new Error('AI_BASE_URL and AI_API_KEY must be configured');
}

const client = axios.create({
  baseURL: AI_BASE_URL,
  timeout: 5000
});

axiosRetry(client, {
  retries: 2,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (err) => !err.response || err.response.status >= 500
});

r.get('/version', async (_req, res) => {
  try {
    const out = await client.get('/ai/version', { headers: { 'x-api-key': AI_API_KEY }});
    res.status(out.status).json(out.data);
  } catch (e: any) {
    res.status(e?.response?.status ?? 502).json({ ok:false, error:'ai_version_failed', details:e?.message });
  }
});

r.get('/ping', async (_req, res) => {
  try {
    const out = await client.get('/ai/ping', { headers: { 'x-api-key': AI_API_KEY }});
    res.status(out.status).json(out.data);
  } catch (e: any) {
    res.status(e?.response?.status ?? 502).json({ ok:false, error:'ai_ping_failed', details:e?.message });
  }
});

r.post('/categorize', async (req, res) => {
  try {
    const out = await client.post('/ai/categorize', req.body, { headers: { 'x-api-key': AI_API_KEY }});
    res.status(out.status).json(out.data);
  } catch (e: any) {
    res.status(e?.response?.status ?? 502).json({ ok:false, error:'ai_categorize_failed', details:e?.message });
  }
});

r.post('/categorize/batch', async (req, res) => {
  try {
    const payload = Array.isArray(req.body) ? { items: req.body } : req.body;
    const out = await client.post('/ai/categorize/batch', payload, { headers: { 'x-api-key': AI_API_KEY }});
    res.status(out.status).json(out.data);
  } catch (e: any) {
    res.status(e?.response?.status ?? 502).json({ ok:false, error:'ai_batch_failed', details:e?.message });
  }
});

// /api/ai/feedback -> proxy POST /ai/feedback
r.post('/feedback', async (req, res) => {
  try {
    const out = await client.post('/ai/feedback', req.body, { headers: { 'x-api-key': AI_API_KEY }});
    res.status(out.status).json(out.data);
  } catch (e: any) {
    res.status(e?.response?.status ?? 502).json({ ok:false, error:'ai_feedback_failed', details: e?.response?.data ?? e?.message });
  }
});

// /api/ai/summarize -> proxy POST /ai/summarize
r.post('/summarize', async (req, res) => {
  try {
    const out = await client.post('/ai/summarize', req.body, { headers: { 'x-api-key': AI_API_KEY }});
    res.status(out.status).json(out.data);
  } catch (e: any) {
    res.status(e?.response?.status ?? 502).json({ ok:false, error:'ai_summarize_failed', details: e?.response?.data ?? e?.message });
  }
});

export default r;
