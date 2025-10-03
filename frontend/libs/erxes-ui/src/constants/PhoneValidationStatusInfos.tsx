import {
  IconCircleDashedCheck,
  IconCircleDashed,
  IconDeviceMobile,
} from '@tabler/icons-react';

export const PhoneIconComponents = {
  IconCircleDashedCheck,
  IconCircleDashed,
  IconDeviceMobile,
} as const;
export type TPhoneValidationStatusInfo = {
  label: string;
  value: string;
  icon: keyof typeof PhoneIconComponents;
  className?: string;
}[];

export const PHONE_VALIDATION_STATUS_INFOS: TPhoneValidationStatusInfo = [
  {
    label: 'Validated',
    value: 'valid',
    icon: 'IconCircleDashedCheck',
    className: 'text-green-500',
  },
  {
    label: 'Unvalidated',
    value: 'invalid',
    icon: 'IconCircleDashed',
    className: 'text-muted-foreground',
  },
  {
    label: 'Unknown',
    value: 'unknown',
    icon: 'IconCircleDashed',
    className: 'text-muted-foreground',
  },
  {
    label: 'Mobile Phone Number',
    value: 'mobile-phone-number',
    icon: 'IconDeviceMobile',
    className: 'text-muted-foreground',
  },
];
// [
//   { label: 'Unknown', value: 'unknown' },
//   { label: 'Valid', value: 'valid' },
//   { label: 'Invalid', value: 'invalid' },
//   {
//     label: 'Accept all unverifiable',
//     value: 'accept_all_unverifiable',
//   },
//   { label: 'Disposable', value: 'disposable' },
//   { label: 'Catch all', value: 'catchall' },
//   { label: 'Bad syntax', value: 'bad_syntax' },
//   { label: 'Not checked', value: 'not_checked' },
// ];
