const AUTOMATED_PRECEDENCES = ['bulk', 'junk', 'auto_reply'];

const AUTOMATED_MARKER_HEADERS = [
  'x-autoreply',
  'x-autorespond',
  'x-autoresponder',
];

const NULL_RETURN_PATHS = ['<>', ''];

const read = (headers: Record<string, string> | undefined, key: string) =>
  (headers?.[key] ?? '').trim().toLowerCase();

export const isAutomatedMessage = (headers?: Record<string, string>) => {
  if (!headers) {
    return false;
  }

  const autoSubmitted = read(headers, 'auto-submitted');

  if (autoSubmitted && autoSubmitted !== 'no') {
    return true;
  }

  if (AUTOMATED_PRECEDENCES.includes(read(headers, 'precedence'))) {
    return true;
  }

  if (AUTOMATED_MARKER_HEADERS.some((key) => read(headers, key))) {
    return true;
  }

  const returnPath = read(headers, 'return-path');

  return (
    Object.prototype.hasOwnProperty.call(headers, 'return-path') &&
    NULL_RETURN_PATHS.includes(returnPath)
  );
};
