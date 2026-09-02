import { getEnv, sendTRPCMessage } from '../../utils';
import { DEFAULT_SEGMENT_TIME_ZONE } from './zonedTime';

const TTL_MS = 5 * 60_000;
const CONFIG_CODE = 'TIMEZONE';

const cache = new Map<string, { value: string; until: number }>();

export const segmentTimeZone = async (subdomain: string): Promise<string> => {
  const cached = cache.get(subdomain);

  if (cached && cached.until > Date.now()) {
    return cached.value;
  }

  const configs: Record<string, unknown> = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'configs',
    action: 'getConfigs',
    method: 'query',
    input: { codes: [CONFIG_CODE] },
    defaultValue: {},
  });

  const configured = configs?.[CONFIG_CODE];

  const value =
    (typeof configured === 'string' && configured.trim()) ||
    getEnv({ name: 'SEGMENT_TIME_ZONE', defaultValue: '' }) ||
    DEFAULT_SEGMENT_TIME_ZONE;

  if (!isResolvable(value)) {
    console.error(`segments: unknown time zone "${value}", using UTC`);

    cache.set(subdomain, {
      value: DEFAULT_SEGMENT_TIME_ZONE,
      until: Date.now() + TTL_MS,
    });

    return DEFAULT_SEGMENT_TIME_ZONE;
  }

  cache.set(subdomain, { value, until: Date.now() + TTL_MS });

  return value;
};

const isResolvable = (timeZone: string): boolean => {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone });
    return true;
  } catch {
    return false;
  }
};
