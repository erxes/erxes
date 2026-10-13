import type { DirectMailComposerStore } from '@/integrations/mail/composer/types/directMailComposerState';
import { createContext } from 'react';

export const DirectMailComposerStateContext =
  createContext<DirectMailComposerStore | null>(null);
