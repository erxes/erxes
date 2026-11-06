import { Badge, RelativeDateDisplay } from 'erxes-ui';
import {
  IconAt,
  IconBuilding,
  IconCalendarPlus,
  IconClock,
  IconHash,
  IconMail,
  IconPhone,
  IconUser,
  IconUserCircle,
} from '@tabler/icons-react';
import {
  ContactRecordChip,
  ContactsRelationField,
  PanelField,
  usePermissionCheck,
  useSidePanel,
} from 'ui-modules';
import { useClientPortalUser } from '@/contacts/client-portal-users/hooks/useClientPortalUser';
import { TextFieldCPUser } from '@/contacts/client-portal-users/cp-user-detail/components/TextFieldCPUser';
import { useCPUserEdit } from '@/contacts/client-portal-users/hooks/useCPUserEdit';
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
    ['firstName', 'First name', IconUser],
    ['lastName', 'Last name', IconUser],
    ['email', 'Email', IconMail],
    ['phone', 'Phone', IconPhone],
    ['username', 'Username', IconAt],
    ['companyRegistrationNumber', 'Company registration number', IconHash],
  ] as const;
  return (
    <div className="flex flex-col gap-1 p-3">
      {textFields.map(([field, label, icon]) => (
        <PanelField
          key={field}
          icon={icon}
          label={t(field, { defaultValue: label })}
        >
          <TextFieldCPUser
            icon={icon}
            field={field}
            _id={_id}
            value={cpUser[field] || ''}
            placeholder={t(field, { defaultValue: label })}
          />
        </PanelField>
      ))}
      <PanelField
        icon={IconUserCircle}
        label={t('type', { defaultValue: 'Type' })}
      >
        <Badge variant="secondary">{type || '-'}</Badge>
      </PanelField>
      <PanelField
        icon={IconBuilding}
        label={t('company', { defaultValue: 'Company' })}
      >
        <ContactsRelationField
          kind="company"
          value={erxesCompanyId}
          readOnly={readOnly}
          onValueChange={(value) =>
            cpUserEdit({ variables: { _id, erxesCompanyId: value || '' } })
          }
        />
      </PanelField>
      <PanelField
        icon={IconUser}
        label={t('customer', { defaultValue: 'Customer' })}
      >
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
        <PanelField
          icon={IconClock}
          label={t('lastLogin', { defaultValue: 'Last login' })}
        >
          <RelativeDateDisplay value={lastLoginAt} asChild>
            <RelativeDateDisplay.Value value={lastLoginAt} />
          </RelativeDateDisplay>
        </PanelField>
      )}
      <PanelField
        icon={IconCalendarPlus}
        label={t('created', { defaultValue: 'Created' })}
      >
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
