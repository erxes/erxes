import {
  EMAIL_SCREEN_REASON_LABELS,
  EMAIL_SUPPRESSION_REASON_OPTIONS,
} from '@/settings/email-addresses/constants';
import { IEmailAddress } from '@/settings/email-addresses/types';

export const suppressionLabel = ({
  suppressionReason,
  screenReason,
}: Pick<IEmailAddress, 'suppressionReason' | 'screenReason'>) => {
  if (!suppressionReason) {
    return undefined;
  }

  const label =
    EMAIL_SUPPRESSION_REASON_OPTIONS.find(
      (option) => option.value === suppressionReason,
    )?.label ?? suppressionReason;

  return screenReason
    ? `${label} · ${EMAIL_SCREEN_REASON_LABELS[screenReason]}`
    : label;
};
