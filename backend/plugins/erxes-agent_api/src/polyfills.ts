// Runtime polyfills — imported FIRST from main.ts.
//
// Web Crypto (`globalThis.crypto`) only became a Node global in v19. Mastra's
// published dist calls the bare global `crypto.randomUUID()` throughout its
// modern execution path (agent.stream / generateId), so on Node 18 every
// native-provider agent run fails with "crypto is not defined" — the legacy
// OpenAI-compatible path doesn't hit those call sites, which is why e.g.
// Gemini broke while Kimi worked. No-op on Node >= 19.
import { webcrypto } from 'node:crypto';

if (typeof globalThis.crypto === 'undefined') {
  (globalThis as { crypto?: unknown }).crypto = webcrypto;
}
