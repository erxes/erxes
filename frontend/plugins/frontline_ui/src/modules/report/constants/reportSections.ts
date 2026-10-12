import {
  IconBrandFacebook,
  IconChartHistogram,
  IconPhoneCall,
  IconTicket,
} from '@tabler/icons-react';
import { TFunction } from 'i18next';

export const REPORT_SECTION_PATHS = {
  overview: '/frontline/reports',
  ticket: '/frontline/reports/ticket',
  facebook: '/frontline/reports/facebook',
  call: '/frontline/reports/call',
} as const;

type TReportSection = keyof typeof REPORT_SECTION_PATHS;

export const getReportSections = (t: TFunction) => [
  {
    section: 'overview' as const,
    label: t('frontline-overview', 'Frontline Overview'),
    icon: IconChartHistogram,
  },
  {
    section: 'ticket' as const,
    label: t('ticket', 'Ticket'),
    icon: IconTicket,
  },
  {
    section: 'facebook' as const,
    label: t('facebook-reports', 'Facebook'),
    icon: IconBrandFacebook,
  },
  {
    section: 'call' as const,
    label: t('call-center', 'Call center'),
    icon: IconPhoneCall,
  },
];

export const getReportSection = (pathname: string): TReportSection => {
  if (pathname.startsWith(REPORT_SECTION_PATHS.call)) {
    return 'call';
  }

  if (pathname.startsWith(REPORT_SECTION_PATHS.ticket)) {
    return 'ticket';
  }

  if (pathname.startsWith(REPORT_SECTION_PATHS.facebook)) {
    return 'facebook';
  }

  return 'overview';
};
