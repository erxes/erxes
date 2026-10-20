import { BodyField } from '@/integrations/mail/composer/components/fields/DirectMailBodyField';
import { FromRow } from '@/integrations/mail/composer/components/fields/DirectMailFromRow';
import { SubjectRow } from '@/integrations/mail/composer/components/fields/DirectMailSubjectRow';
import { ComposerRecipients } from '@/integrations/mail/composer/components/recipients/DirectMailComposerRecipients';
import { useDirectMailComposerContext } from '@/integrations/mail/composer/hooks/useDirectMailComposerFields';
export { BodyField } from '@/integrations/mail/composer/components/fields/DirectMailBodyField';
export { FromRow } from '@/integrations/mail/composer/components/fields/DirectMailFromRow';
export { SubjectRow } from '@/integrations/mail/composer/components/fields/DirectMailSubjectRow';
export { CcBccFields } from '@/integrations/mail/composer/components/recipients/DirectMailCcBccFields';

export const ComposerFields = () => {
  const { sending, failedDelivery } = useDirectMailComposerContext();
  const disabled = sending || Boolean(failedDelivery);
  return (
    <fieldset
      disabled={disabled}
      className="flex min-h-0 flex-1 flex-col text-foreground"
    >
      <FromRow />
      <ComposerRecipients />
      <SubjectRow />
      <BodyField />
    </fieldset>
  );
};
