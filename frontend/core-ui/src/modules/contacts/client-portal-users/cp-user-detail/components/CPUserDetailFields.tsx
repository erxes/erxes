import { Badge, RelativeDateDisplay } from 'erxes-ui';
import { SelectCustomer } from 'ui-modules';
import { DataListItem } from '@/contacts/components/ContactDataListItem';
import { useClientPortalUser } from '@/contacts/client-portal-users/hooks/useClientPortalUser';
import { TextFieldCPUser } from '@/contacts/client-portal-users/cp-user-detail/components/TextFieldCPUser';
import { useCPUserEdit } from '@/contacts/client-portal-users/hooks/useCPUserEdit';
import { useTranslation } from 'react-i18next';

export function CPUserDetailFields() {
  const { cpUser } = useClientPortalUser();
  const { cpUserEdit } = useCPUserEdit();
  const { t } = useTranslation('contact', {
    keyPrefix: 'clientPortalUser.detail',
  });

  if (!cpUser) return null;

  const { _id, type, lastLoginAt, createdAt, erxesCustomerId } = cpUser;

  return (
    <div className="py-8 space-y-6 px-8">
      <div className="font-medium flex gap-5 flex-col">
        <div className="grid grid-cols-2 gap-5 col-span-5">
          <DataListItem label={t('firstName', { defaultValue: 'First name' })}>
            <TextFieldCPUser
              field="firstName"
              _id={_id}
              value={cpUser.firstName ?? ''}
              placeholder={t('addFirstName', {
                defaultValue: 'Add first name',
              })}
            />
          </DataListItem>
          <DataListItem label={t('lastName', { defaultValue: 'Last name' })}>
            <TextFieldCPUser
              field="lastName"
              _id={_id}
              value={cpUser.lastName ?? ''}
              placeholder={t('addLastName', { defaultValue: 'Add last name' })}
            />
          </DataListItem>
          <DataListItem label={t('email', { defaultValue: 'Email' })}>
            <TextFieldCPUser
              field="email"
              _id={_id}
              value={cpUser.email ?? ''}
              placeholder={t('addEmail', { defaultValue: 'Add email' })}
            />
          </DataListItem>
          <DataListItem label={t('phone', { defaultValue: 'Phone' })}>
            <TextFieldCPUser
              field="phone"
              _id={_id}
              value={cpUser.phone ?? ''}
              placeholder={t('addPhone', { defaultValue: 'Add phone' })}
            />
          </DataListItem>
          <DataListItem label={t('type', { defaultValue: 'Type' })}>
            {type ? (
              <Badge variant="secondary">{type}</Badge>
            ) : (
              <span className="text-muted-foreground">-</span>
            )}
          </DataListItem>
          <DataListItem label={t('username', { defaultValue: 'Username' })}>
            <TextFieldCPUser
              field="username"
              _id={_id}
              value={cpUser.username ?? ''}
              placeholder={t('addUsername', { defaultValue: 'Add username' })}
            />
          </DataListItem>
          <DataListItem label={t('company', { defaultValue: 'Company' })}>
            <TextFieldCPUser
              field="companyName"
              _id={_id}
              value={cpUser.companyName ?? ''}
              placeholder={t('addCompany', { defaultValue: 'Add company' })}
            />
          </DataListItem>
          <DataListItem
            label={t('companyRegistrationNumber', {
              defaultValue: 'Company registration number',
            })}
          >
            <TextFieldCPUser
              field="companyRegistrationNumber"
              _id={_id}
              value={cpUser.companyRegistrationNumber ?? ''}
              placeholder={t('addCompanyRegNumber', {
                defaultValue: 'Add registration number',
              })}
            />
          </DataListItem>
          <DataListItem
            label={t('customer', { defaultValue: 'Customer' })}
          >
            {type === 'customer' ? (
              <SelectCustomer
                mode="single"
                value={erxesCustomerId ?? ''}
                onValueChange={(value) =>
                  cpUserEdit({
                    variables: {
                      _id,
                      erxesCustomerId:
                        typeof value === 'string'
                          ? value || undefined
                          : value && value.length > 0
                            ? value[0]
                            : undefined,
                    },
                  })
                }
              />
            ) : (
              <span className="text-muted-foreground">
                {erxesCustomerId || '-'}
              </span>
            )}
          </DataListItem>
        </div>
        {lastLoginAt && (
          <DataListItem label={t('lastLogin', { defaultValue: 'Last login' })}>
            <RelativeDateDisplay value={lastLoginAt} asChild>
              <RelativeDateDisplay.Value value={lastLoginAt} />
            </RelativeDateDisplay>
          </DataListItem>
        )}
        <DataListItem label={t('created', { defaultValue: 'Created' })}>
          {createdAt ? (
            <RelativeDateDisplay value={createdAt} asChild>
              <RelativeDateDisplay.Value value={createdAt} />
            </RelativeDateDisplay>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </DataListItem>
      </div>
    </div>
  );
}
