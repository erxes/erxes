import { DirectMailComposerContent } from '@/integrations/mail/composer/components/DirectMailComposerContent';
import { DirectMailComposerStateContext } from '@/integrations/mail/composer/contexts/DirectMailComposerStateContext';
import { useDirectMailComposerState } from '@/integrations/mail/composer/hooks/useDirectMailComposerState';
import { Form } from 'erxes-ui';

export const DirectMailComposer = () => {
  const state = useDirectMailComposerState();
  return (
    <Form {...state.form}>
      <DirectMailComposerStateContext.Provider value={state}>
        <DirectMailComposerContent />
      </DirectMailComposerStateContext.Provider>
    </Form>
  );
};
