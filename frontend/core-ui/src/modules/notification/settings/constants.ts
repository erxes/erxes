import { IconBox, IconDeviceMobile, IconMail } from '@tabler/icons-react';

export const NOTIFICATION_CHANNELS = {
  email: {
    label: 'Email',
    available: true,
    icon: IconMail,
  },
  mobile: {
    label: 'Mobile',
    available: false,
    icon: IconDeviceMobile,
  },
  other: {
    label: 'Other',
    available: false,
    icon: IconBox,
  },
};
