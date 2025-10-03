import dayjs from 'dayjs';
import { Card, Label, Sheet, Separator } from 'erxes-ui';
import { UAParser } from 'ua-parser-js';
import { ILogDoc } from '../types';
import {
  IconBrowser,
  IconClockHour1,
  IconDeviceDesktopCode,
  IconDeviceImac,
  IconMail,
  IconMapPin,
  IconShield,
} from '@tabler/icons-react';

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

export const AuthLogDetailContent = ({ payload, createdAt }: ILogDoc) => {
  const { headers } = payload || {};

  const {
    ip = '',
    device = '',
    os = '',
    browser = '',
  } = getClientInfo(headers) || {};
  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="border-b pb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Authentication Details
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          User session and device information
        </p>
      </div>
      <Sheet.Description>User Information </Sheet.Description>
      <div className="flex flex-row justify-between">
        <Card className="flex flex-row items-center gap-4 py-2 px-4">
          <div className="bg-foreground/20 p-2 rounded-xl text-foreground/80">
            <IconMail />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Email</Label>
            <span>{payload.email}</span>
          </div>
        </Card>
        <Card className="flex flex-row items-center gap-4 py-2 px-4">
          <div className="bg-success/20 p-2 rounded-xl text-success/80">
            <IconClockHour1 />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Time</Label>
            <span>{dayjs(createdAt).format('YYYY-MM-DD HH:mm:ss')}</span>
          </div>
        </Card>
        <Card className="flex flex-row items-center gap-4 py-2 px-4">
          <div className="bg-primary/20 p-2 rounded-xl text-primary/80">
            <IconShield />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Method</Label>
            <span>{payload.method}</span>
          </div>
        </Card>
      </div>
      <Separator />
      <div className="w-full flex flex-row justify-between">
        <Card className="flex flex-col gap-2 items-center size-36 justify-center">
          <div className="bg-warning/20 p-2 rounded-xl text-warning/80">
            <IconMapPin />
          </div>
          <p>IP Address</p>
          <span>{ip}</span>
        </Card>
        <Card className="flex flex-col gap-2 items-center size-36 justify-center">
          <div className="bg-foreground/20 p-2 rounded-xl text-foreground/80">
            <IconDeviceImac />
          </div>
          <p>Device</p>
          <span>{device}</span>
        </Card>
        <Card className="flex flex-col gap-2 items-center size-36 justify-center">
          <div className="bg-primary/20 p-2 rounded-xl text-primary/80">
            <IconDeviceDesktopCode />
          </div>
          <p>Os</p>
          <span>{os}</span>
        </Card>
        <Card className="flex flex-col gap-2 items-center size-36 justify-center">
          <div className="bg-success/20 p-2 rounded-xl text-success/80">
            <IconBrowser />
          </div>
          <p>Browser</p>
          <span>{browser}</span>
        </Card>
      </div>
    </div>
  );
};
