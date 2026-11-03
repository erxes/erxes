import { TextDecoder, TextEncoder } from 'node:util';
import {
  ReadableStream,
  TextDecoderStream,
  TextEncoderStream,
  TransformStream,
  WritableStream,
} from 'node:stream/web';

// jsdom lacks the Web Streams and encoding globals `ai` reads when it loads.
Object.assign(globalThis, {
  ReadableStream,
  TransformStream,
  WritableStream,
  TextDecoderStream,
  TextEncoderStream,
  TextEncoder: globalThis.TextEncoder ?? TextEncoder,
  TextDecoder: globalThis.TextDecoder ?? TextDecoder,
});
