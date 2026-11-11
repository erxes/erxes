import { Button, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useContactRelations } from '~/modules/contacts/components/useContactRelations';
import { ContactDetailSection } from './ContactDetailSection';
import { ContactRelationInput } from './ContactRelationInput';

type TContactType = 'core:customer' | 'core:company';

/** Edits customer ↔ company links in their own section. */
export const ContactPanelRelationField = ({
  contentType,
  contentId,
}: {
  contentType: TContactType;
  contentId: string;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const { relatedIds, loading, error, refetch, saving, setRelatedIds } = useContactRelations(
    contentType,
    contentId,
  );
  const kind = contentType === 'core:customer' ? 'company' : 'customer';
  const label = kind === 'company' ? t('companies', 'Companies') : t('customers', 'Customers');

  let content = (
    <ContactRelationInput
      kind={kind}
      value={relatedIds}
      onValueChange={(ids) => {
        setRelatedIds(ids).catch(() => undefined);
      }}
      scope={`contact-detail.${contentType}.${contentId}.${kind}`}
      disabled={saving}
    />
  );

  if (error) {
    content = (
      <div className="px-2 text-xs text-destructive">
        {t('relations-error', 'Unable to load linked records')}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            refetch().catch(() => undefined);
          }}
        >
          {t('retry', 'Try again')}
        </Button>
      </div>
    );
  }

  if (loading) content = <Spinner containerClassName="h-7 justify-start px-2" size="sm" />;

  return <ContactDetailSection title={label}>{content}</ContactDetailSection>;
};
