import {
  IconClipboardCheck,
  IconClover,
  IconCoins,
  IconDiscount2,
  IconHeartHandshake,
  IconRotateClockwise2,
  IconTicket,
  IconWallet,
} from '@tabler/icons-react';

// Loyalty settings pages, in the order the settings menu lists them; wallets
// come first because every campaign writes to one.
export const LOYALTY_SETTINGS_PAGES = [
  { path: 'account-type', label: 'loyalty-account-types', icon: IconWallet },
  { path: 'score', label: 'score', icon: IconCoins },
  { path: 'voucher', label: 'voucher', icon: IconTicket },
  { path: 'lottery', label: 'lottery', icon: IconClover },
  { path: 'spin', label: 'spin', icon: IconRotateClockwise2 },
  { path: 'donate', label: 'donate', icon: IconHeartHandshake },
  { path: 'assignment', label: 'assignment', icon: IconClipboardCheck },
  { path: 'coupon', label: 'coupon', icon: IconDiscount2 },
] as const;

export const SETTINGS_ROUTES: Record<string, string> = Object.fromEntries(
  LOYALTY_SETTINGS_PAGES.map(({ path, label }) => [
    `/settings/loyalty/config/${path}`,
    label,
  ]),
);
