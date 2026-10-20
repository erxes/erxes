import { DirectMailComposerStateContext } from '@/integrations/mail/composer/contexts/DirectMailComposerStateContext';
import type { DirectMailComposerStore } from '@/integrations/mail/composer/types/directMailComposerState';
import { useContext } from 'react';

export const useDirectMailComposerStateContext =
  (): DirectMailComposerStore => {
    const state = useContext(DirectMailComposerStateContext);
    if (!state)
      throw new Error(
        'Direct mail hooks must be used within DirectMailComposer',
      );
    return state;
  };
