import type { DirectMailRecipientStore } from '@/integrations/mail/composer/types/directMailRecipient';
import { createContext } from 'react';

export const DirectMailRecipientStateContext =
  createContext<DirectMailRecipientStore | null>(null);
