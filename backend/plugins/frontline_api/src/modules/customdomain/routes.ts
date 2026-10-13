import express, { Router } from 'express';
import { resolveCustomDomain } from '@/customdomain/service';

export const router: Router = express.Router();

/*
 * The help center app asks which tenant a custom hostname belongs to before
 * rendering it. Only active domains resolve, and the answer is the same
 * subdomain the domain's public CNAME already points at.
 */
router.get('/resolve', async (req, res) => {
  const host = typeof req.query.host === 'string' ? req.query.host : '';

  try {
    const subdomain = await resolveCustomDomain(host);

    if (!subdomain) {
      return res.status(404).json({ error: 'Unknown domain' });
    }

    res.set('cache-control', 'private, max-age=60');

    return res.json({ subdomain });
  } catch (e) {
    console.error('[customdomain] resolve failed:', e);

    return res.status(500).json({ error: 'Could not resolve domain' });
  }
});
