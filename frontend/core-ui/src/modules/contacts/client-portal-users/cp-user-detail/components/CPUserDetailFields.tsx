import { Badge, RelativeDateDisplay } from 'erxes-ui';
import {
  ContactRecordChip,
  ContactsRelationField,
  PanelField,
  usePermissionCheck,
  useSidePanel,
} from 'ui-modules';
import { useClientPortalUser } from '../../hooks/useClientPortalUser';
import { TextFieldCPUser } from './TextFieldCPUser';
import { useCPUserEdit } from '../../hooks/useCPUserEdit';
import { useTranslation } from 'react-i18next';

export const CPUserDetailFields = () => {
  const { cpUser } = useClientPortalUser();
  const { cpUserEdit } = useCPUserEdit();
  const { hasActionPermission } = usePermissionCheck();
  const { openRecord } = useSidePanel();
  const { t } = useTranslation('contact', {
    keyPrefix: 'clientPortalUser.detail',
  });
  if (!cpUser) return null;
  const { _id, type, lastLoginAt, createdAt, erxesCustomerId, erxesCompanyId } =
    cpUser;
  const readOnly = !hasActionPermission('clientPortalManage');
  const textFields = [
    ['firstName', 'First name'],
    ['lastName', 'Last name'],
    ['email', 'Email'],
    ['phone', 'Phone'],
    ['username', 'Username'],
    ['companyRegistrationNumber', 'Company registration number'],
  ] as const;
  return (
    <div className="flex flex-col gap-1 p-3">
      {textFields.map(([field, label]) => (
        <PanelField key={field} label={t(field, { defaultValue: label })}>
          <TextFieldCPUser
            field={field}
            _id={_id}
            value={cpUser[field] || ''}
          />
        </PanelField>
      ))}
      <PanelField label={t('type', { defaultValue: 'Type' })}>
        <Badge variant="secondary">{type || '-'}</Badge>
      </PanelField>
      <PanelField label={t('company', { defaultValue: 'Company' })}>
        <ContactsRelationField
          kind="company"
          value={erxesCompanyId}
          readOnly={readOnly}
          onValueChange={(value) =>
            cpUserEdit({ variables: { _id, erxesCompanyId: value || '' } })
          }
        />
      </PanelField>
      <PanelField label={t('customer', { defaultValue: 'Customer' })}>
        {type === 'customer' ? (
          <ContactsRelationField
            kind="customer"
            value={erxesCustomerId}
            readOnly={readOnly}
            onValueChange={(value) =>
              cpUserEdit({ variables: { _id, erxesCustomerId: value || '' } })
            }
          />
        ) : erxesCustomerId ? (
          <ContactRecordChip
            kind="customer"
            id={erxesCustomerId}
            onOpen={() =>
              openRecord(
                { contentType: 'core:customer', contentId: erxesCustomerId },
                { stack: true },
              )
            }
          />
        ) : (
          '-'
        )}
      </PanelField>
      {lastLoginAt && (
        <PanelField label={t('lastLogin', { defaultValue: 'Last login' })}>
          <RelativeDateDisplay value={lastLoginAt} asChild>
            <RelativeDateDisplay.Value value={lastLoginAt} />
          </RelativeDateDisplay>
        </PanelField>
      )}
      <PanelField label={t('created', { defaultValue: 'Created' })}>
        {createdAt ? (
          <RelativeDateDisplay value={createdAt} asChild>
            <RelativeDateDisplay.Value value={createdAt} />
          </RelativeDateDisplay>
        ) : (
          '-'
        )}
      </PanelField>
    </div>
  );
};
