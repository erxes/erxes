export function debugError(payload: string | Error): void {
  const message =
    typeof payload === 'string'
      ? payload
      : payload?.message || String(payload);
  console.error('[posclient]', message);
}
