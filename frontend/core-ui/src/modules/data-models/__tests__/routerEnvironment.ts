import { TextDecoder, TextEncoder } from 'node:util';

// React Router 7 needs these Web APIs, which this project's jsdom omits.
Object.assign(globalThis, { TextDecoder, TextEncoder });
