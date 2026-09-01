export const debugCallPro = (...args: unknown[]) =>
  console.log('[callpro]', ...args);

export const debugCallProError = (...args: unknown[]) =>
  console.error('[callpro:error]', ...args);
