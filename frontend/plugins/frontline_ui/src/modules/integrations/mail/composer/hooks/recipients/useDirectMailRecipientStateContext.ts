import { DirectMailRecipientStateContext } from '@/integrations/mail/composer/contexts/DirectMailRecipientStateContext';
import type { DirectMailRecipientStore } from '@/integrations/mail/composer/types/directMailRecipient';
import { useContext } from 'react';

export const useDirectMailRecipientStateContext =
  (): DirectMailRecipientStore => {
    const state = useContext(DirectMailRecipientStateContext);
    if (!state)
      throw new Error('Recipient hooks must be used within VerifiedEmailField');
    return state;
  };
