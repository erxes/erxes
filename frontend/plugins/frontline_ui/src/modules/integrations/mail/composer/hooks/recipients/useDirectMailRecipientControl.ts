import { DirectMailRecipientContext } from '@/integrations/mail/composer/contexts/DirectMailRecipientContext';
import type { DirectMailRecipientControl } from '@/integrations/mail/composer/types/directMailRecipient';
import { useContext } from 'react';

export const useDirectMailRecipientControl = (): DirectMailRecipientControl => {
  const field = useContext(DirectMailRecipientContext);
  if (!field)
    throw new Error(
      'Recipient inputs must be rendered within their form field',
    );
  return field;
};
