import { TextDecoder, TextEncoder } from 'node:util';

Object.assign(globalThis, {
  TextDecoder,
  TextEncoder,
});
