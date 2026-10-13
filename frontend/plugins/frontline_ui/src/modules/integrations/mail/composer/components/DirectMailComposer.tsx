import { DirectMailComposerContent } from '@/integrations/mail/composer/components/DirectMailComposerContent';
import { DirectMailComposerStateContext } from '@/integrations/mail/composer/contexts/DirectMailComposerStateContext';
import { useDirectMailComposerState } from '@/integrations/mail/composer/hooks/useDirectMailComposerState';
import { FormProvider } from 'react-hook-form';

export const DirectMailComposer = () => {
  const state = useDirectMailComposerState();
  return (
    <FormProvider {...state.form}>
      <DirectMailComposerStateContext.Provider value={state}>
        <DirectMailComposerContent />
      </DirectMailComposerStateContext.Provider>
    </FormProvider>
  );
};
