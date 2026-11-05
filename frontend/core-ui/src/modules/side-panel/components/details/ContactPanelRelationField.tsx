import { IconBuilding, IconUser } from '@tabler/icons-react';
import { Button, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  PanelField,
  useManageRelations,
  usePermissionCheck,
  useRelations,
} from 'ui-modules';
import { ContactRelationInput } from './ContactRelationInput';

type TContactType = 'core:customer' | 'core:company';

/** Edits reciprocal contact links in the detail rows, preserving multiple links. */
export const ContactPanelRelationField = ({
  contentType,
  contentId,
}: {
  contentType: TContactType;
  contentId: string;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const { hasActionPermission } = usePermissionCheck();
  const { manageRelations, loading: saving } = useManageRelations();
  const kind = contentType === 'core:customer' ? 'company' : 'customer';
  const relatedContentType =
    kind === 'company' ? 'core:company' : 'core:customer';
  const variables = { contentType, contentId, relatedContentType };
  const { relatedIds, loading, error, refetch } = useRelations({ variables });
  const label =
    kind === 'company' ? t('company', 'Company') : t('customer', 'Customer');
  const canEdit = hasActionPermission('contactsUpdate');
  const handleChange = (relatedContentIds: string[]) => {
    manageRelations({ ...variables, relatedContentIds }).catch(() => undefined);
  };

  let content = (
    <ContactRelationInput
      kind={kind}
      value={relatedIds}
      onValueChange={canEdit ? handleChange : undefined}
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
  if (loading)
    content = <Spinner containerClassName="h-7 justify-start px-2" size="sm" />;
  return (
    <PanelField
      icon={kind === 'company' ? IconBuilding : IconUser}
      label={label}
    >
      {content}
    </PanelField>
  );
};
