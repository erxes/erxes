import {
  IconBrowser,
  IconDeviceDesktopCode,
  IconDeviceImac,
  IconGlobe,
  IconMapPin,
  IconShield,
} from '@tabler/icons-react';
import { UAParser } from 'ua-parser-js';
import { ILogDoc } from '../types';
import { maskIpValue } from '../utils/logFormUtils';
import { LogDetailMetricCard, LogDetailSection } from './LogDetailPrimitives';

const getClientInfo = (headers: any) => {
  if (!headers) {
    return;
  }
  const defaulIp = '127.0.0.1';
  const xForwardedFor = headers['x-forwarded-for'] || '';
  const xRealIp = headers['x-real-ip'] || '';
  const cfConnectionIp = headers['cf-connecting-ip'] || '';
  const trueClientIp = headers['true-client-ip'] || '';
  const host = headers['host'] || '';

  const userAgent = headers['user-agent'] || '';
  const ip =
    xForwardedFor?.split(',')[0].trim() ||
    xRealIp ||
    cfConnectionIp ||
    trueClientIp ||
    host?.split(':')[0] || // fallback
    defaulIp;

  const ua = UAParser(userAgent);

  const browser = `${ua.browser.name || 'Unknown'} ${
    ua.browser.version || ''
  }`.trim();
  const os = `${ua.os.name || 'Unknown'} ${ua.os.version || ''}`.trim();
  const device = ua.device.type || 'Desktop';

  return {
    ip,
    device,
    browser,
    os,
  };
};

export const AuthLogDetailContent = ({ payload }: ILogDoc) => {
  const { headers } = payload || {};

  const {
    ip = '',
    device = '',
    os = '',
    browser = '',
  } = getClientInfo(headers) || {};
  return (
    <LogDetailSection
      title="Session Details"
      description="Device, network, and authentication context captured for this session."
      icon={IconShield}
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <LogDetailMetricCard
          title="IP Address"
          value={maskIpValue(ip)}
          icon={IconMapPin}
        />
        <LogDetailMetricCard
          title="Device"
          value={device}
          icon={IconDeviceImac}
        />
        <LogDetailMetricCard
          title="Operating System"
          value={os}
          icon={IconDeviceDesktopCode}
        />
        <LogDetailMetricCard
          title="Browser"
          value={browser}
          icon={IconBrowser}
        />
        <LogDetailMetricCard
          title="Auth Method"
          value={payload?.method}
          icon={IconGlobe}
        />
      </div>
    </LogDetailSection>
  );
};
