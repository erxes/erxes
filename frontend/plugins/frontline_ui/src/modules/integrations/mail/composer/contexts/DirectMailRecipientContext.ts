import type { DirectMailRecipientControl } from '@/integrations/mail/composer/types/directMailRecipient';
import { createContext } from 'react';

export const DirectMailRecipientContext =
  createContext<DirectMailRecipientControl | null>(null);
