import { z } from 'zod';

export const CALL_CONFIG_SCHEMA = z.object({
  STUN_SERVER_URL: z.string(),
  TURN_SERVER_URL: z.string(),
  TURN_SERVER_USERNAME: z.string(),
  TURN_SERVER_CREDENTIAL: z.string(),
});
