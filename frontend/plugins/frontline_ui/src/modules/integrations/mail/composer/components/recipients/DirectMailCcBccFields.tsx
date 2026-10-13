import { RecipientRow } from '@/integrations/mail/composer/components/recipients/DirectMailRecipientField';
import { DirectMailRecipientContext } from '@/integrations/mail/composer/contexts/DirectMailRecipientContext';
import { useDirectMailComposerFields } from '@/integrations/mail/composer/hooks/useDirectMailComposerFields';
import type { ComposeValues } from '@/integrations/mail/composer/types/directMailComposer';
import { Form } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';

export const CcBccFields = () => {
  const { control } = useFormContext<ComposeValues>();
  const { showCc, showBcc } = useDirectMailComposerFields();
  return (
    <>
      {(['cc', 'bcc'] as const).map(
        (field) =>
          (field === 'cc' ? showCc : showBcc) && (
            <Form.Field
              key={field}
              control={control}
              name={field}
              render={({ field: recipient }) => (
                <DirectMailRecipientContext.Provider value={recipient}>
                  <RecipientRow />
                </DirectMailRecipientContext.Provider>
              )}
            />
          ),
      )}
    </>
  );
};
