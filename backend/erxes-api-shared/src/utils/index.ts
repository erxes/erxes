// Polyfill SlowBuffer for legacy packages (e.g. buffer-equal-constant-time)
// that still reference the global removed in Node.js 22+.
declare global {
  // eslint-disable-next-line no-var
  var SlowBuffer: typeof Buffer.allocUnsafeSlow | undefined;
}

if (typeof globalThis.SlowBuffer === 'undefined') {
  globalThis.SlowBuffer = Buffer.allocUnsafeSlow;
}

export * from './apollo';
export * from './constants';
export * from './elasticsearch';
export * from './graphqlPubSub';
export * from './headers';
export * from './logs';
export * from './knowledge';
export * from './mongo';
export * from './mq-worker';
export * from './random';
export * from './redis';
export * from './saas';
export * from './sanitize';
export * from './service-discovery';
export * from './start-plugin';
export * from './trpc';
export * from './trpc/sendCoreModuleProducer';
export * from './utils';
export * from './file/read';
export * from './file/upload';
export * from './mongo/cursor-util';
export * from './string';
export * from './bulkUtils';
export * from './editor';
export * from './errorClassifier';
export * from './sentry-init';
