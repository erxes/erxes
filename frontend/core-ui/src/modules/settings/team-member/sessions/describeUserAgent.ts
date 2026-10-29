// Order matters: Edge and Opera also say Chrome, Chrome also says Safari
const BROWSERS: [RegExp, string][] = [
  [/Edg\//, 'Edge'],
  [/OPR\//, 'Opera'],
  [/Firefox\//, 'Firefox'],
  [/Chrome\//, 'Chrome'],
  [/Safari\//, 'Safari'],
];

const SYSTEMS: [RegExp, string][] = [
  [/iPhone|iPad/, 'iOS'],
  [/Android/, 'Android'],
  [/Mac OS X/, 'macOS'],
  [/Windows/, 'Windows'],
  [/Linux/, 'Linux'],
];

const firstMatch = (value: string, rules: [RegExp, string][]) =>
  rules.find(([pattern]) => pattern.test(value))?.[1];

/** "Chrome on macOS"; null when the agent is missing or unrecognized. */
export const describeUserAgent = (userAgent?: string | null) => {
  if (!userAgent) return null;

  const browser = firstMatch(userAgent, BROWSERS);
  const system = firstMatch(userAgent, SYSTEMS);

  if (browser && system) return `${browser} · ${system}`;

  return browser || system || null;
};
