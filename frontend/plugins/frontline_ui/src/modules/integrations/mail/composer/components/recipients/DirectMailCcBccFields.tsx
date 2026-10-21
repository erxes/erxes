import { RecipientRow } from '@/integrations/mail/composer/components/recipients/DirectMailRecipientField';
import { DirectMailRecipientContext } from '@/integrations/mail/composer/contexts/DirectMailRecipientContext';
import {
  useDirectMailComposerContext,
  useDirectMailComposerFields,
} from '@/integrations/mail/composer/hooks/useDirectMailComposerFields';
import { Form } from 'erxes-ui';

export const CcBccFields = () => {
  const {
    form: { control },
  } = useDirectMailComposerContext();
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
