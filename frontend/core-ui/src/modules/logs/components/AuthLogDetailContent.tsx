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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('common', { keyPrefix: 'logs' });
  const { headers } = payload || {};

  const {
    ip = '',
    device = '',
    os = '',
    browser = '',
  } = getClientInfo(headers) || {};
  return (
    <LogDetailSection
      title={t('session-details')}
      description={t('session-details-description')}
      icon={IconShield}
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <LogDetailMetricCard
          title={t('ip-address')}
          value={maskIpValue(ip)}
          icon={IconMapPin}
        />
        <LogDetailMetricCard
          title={t('device')}
          value={device}
          icon={IconDeviceImac}
        />
        <LogDetailMetricCard
          title={t('operating-system')}
          value={os}
          icon={IconDeviceDesktopCode}
        />
        <LogDetailMetricCard
          title={t('browser')}
          value={browser}
          icon={IconBrowser}
        />
        <LogDetailMetricCard
          title={t('auth-method')}
          value={payload?.method}
          icon={IconGlobe}
        />
      </div>
    </LogDetailSection>
  );
};
