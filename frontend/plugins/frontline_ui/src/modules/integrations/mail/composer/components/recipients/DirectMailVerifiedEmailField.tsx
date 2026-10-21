import { VerifiedEmailFieldContent } from '@/integrations/mail/composer/components/recipients/DirectMailVerifiedEmailFieldContent';
import { DirectMailRecipientStateContext } from '@/integrations/mail/composer/contexts/DirectMailRecipientStateContext';
import { useDirectMailRecipientState } from '@/integrations/mail/composer/hooks/recipients/useDirectMailRecipientState';

export const VerifiedEmailField = () => {
  const state = useDirectMailRecipientState();
  return (
    <DirectMailRecipientStateContext.Provider value={state}>
      <VerifiedEmailFieldContent />
    </DirectMailRecipientStateContext.Provider>
  );
};
