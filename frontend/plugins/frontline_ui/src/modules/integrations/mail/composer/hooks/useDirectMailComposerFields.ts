import { DirectMailComposerContext } from '@/integrations/mail/composer/contexts/DirectMailComposerContext';
import type { DirectMailComposerFieldsState } from '@/integrations/mail/composer/types/directMailComposerFields';
import type { DirectMailComposerState } from '@/integrations/mail/composer/types/directMailComposerState';
import { useContext } from 'react';

export const useDirectMailComposerContext = (): DirectMailComposerState => {
  const state = useContext(DirectMailComposerContext);
  if (!state)
    throw new Error(
      'Direct mail components must be used within DirectMailComposer',
    );
  return state;
};

export const useDirectMailComposerFields = (): DirectMailComposerFieldsState =>
  useDirectMailComposerContext().fieldActions;
