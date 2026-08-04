export function extractErrorMessage(e: any): string {
  if (!e) return 'Unknown error';
  if (typeof e === 'string') return e;

  if (e?.response?.data?.message) return e.response.data.message;
  if (e?.response?.data?.error) return e.response.data.error;
  if (e?.response?.data?.errorDesc) return e.response.data.errorDesc;

  if (e?.message) return e.message;

  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}
