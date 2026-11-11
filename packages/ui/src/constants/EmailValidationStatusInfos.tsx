import { IconCircleDashedCheck, IconCircleDashed } from '@tabler/icons-react';

export const EmailIconComponents = {
  IconCircleDashedCheck,
  IconCircleDashed,
} as const;
export type TEmailValidationStatusInfo = {
  label: string;
  value: string;
  icon: keyof typeof EmailIconComponents;
  className?: string;
}[];

export const EMAIL_VALIDATION_STATUS_INFOS: TEmailValidationStatusInfo = [
  {
    label: 'Validated',
    value: 'valid',
    icon: 'IconCircleDashedCheck',
    className: 'text-green-500',
  },
  {
    label: 'Unknown',
    value: 'unknown',
    icon: 'IconCircleDashed',
    className: 'text-muted-foreground',
  },
  {
    label: 'Unvalidated',
    value: 'invalid',
    icon: 'IconCircleDashed',
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
