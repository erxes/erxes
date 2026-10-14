import { CcBccFields } from '@/integrations/mail/composer/components/recipients/DirectMailCcBccFields';
import { RecipientRow } from '@/integrations/mail/composer/components/recipients/DirectMailRecipientField';
import { DirectMailRecipientContext } from '@/integrations/mail/composer/contexts/DirectMailRecipientContext';
import {
  useDirectMailComposerContext,
  useDirectMailComposerFields,
} from '@/integrations/mail/composer/hooks/useDirectMailComposerFields';
import { splitAddresses } from '@/integrations/mail/composer/utils/directMailComposer';
import { Button, Form } from 'erxes-ui';
import { useState } from 'react';
import { useWatch } from 'react-hook-form';
export const ComposerRecipients = () => {
  const [expanded, setExpanded] = useState(true);
  const { closeEmptyFields } = useDirectMailComposerFields();
  const {
    form: {
      control,
      formState: { errors },
    },
  } = useDirectMailComposerContext();
  const showFields = expanded || Boolean(errors.to || errors.cc || errors.bcc);
  const [to, cc, bcc] = useWatch({ control, name: ['to', 'cc', 'bcc'] });
  const recipients = [
    ...splitAddresses(to),
    ...splitAddresses(cc),
    ...splitAddresses(bcc),
  ];

  return (
    <>
      <div
        className={showFields ? undefined : 'hidden'}
        onFocusCapture={() => setExpanded(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setExpanded(false);
            closeEmptyFields();
          }
        }}
      >
        <Form.Field
          control={control}
          name="to"
          render={({ field }) => (
            <DirectMailRecipientContext.Provider value={field}>
              <RecipientRow />
            </DirectMailRecipientContext.Provider>
          )}
        />
        <CcBccFields />
      </div>
      {!showFields && (
        <div className="flex flex-none items-center border-b px-4 py-1.5">
          <Button
            type="button"
            variant="ghost"
            className="h-9 min-w-0 w-full justify-start px-0 hover:bg-transparent"
            aria-label="Edit recipients"
            onClick={() => {
              setExpanded(true);
              window.requestAnimationFrame(() =>
                document.getElementById('direct-mail-to')?.focus(),
              );
            }}
          >
            <span className="truncate text-sm text-muted-foreground">
              {recipients[0] || 'Recipients'}
              {recipients.length > 1 && ` +${recipients.length - 1}`}
              {splitAddresses(bcc).length > 0 &&
                ` (${splitAddresses(bcc).length} Bcc)`}
            </span>
          </Button>
        </div>
      )}
    </>
  );
};
