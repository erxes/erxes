/** Random base36 suffix from the Web Crypto API (Math.random is flagged as a
 * weak PRNG even for non-secret ids — getRandomValues works on any origin). */
export const randomIdSuffix = (length: number): string => {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => (b % 36).toString(36)).join('');
};

export const generateThreadId = (): string =>
  `thread-${Date.now()}-${randomIdSuffix(7)}`;
