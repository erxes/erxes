import type { DirectMailComposerState } from '@/integrations/mail/composer/types/directMailComposerState';
import { createContext } from 'react';

export const DirectMailComposerContext =
  createContext<DirectMailComposerState | null>(null);
