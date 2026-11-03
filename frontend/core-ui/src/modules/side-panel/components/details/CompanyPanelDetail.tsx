import {
  IconBell,
  IconBuilding,
  IconBuildingFactory,
  IconForms,
  IconHash,
  IconMail,
  IconMapPin,
  IconPhone,
  IconTag,
  IconUser,
  IconUsers,
  IconWorld,
} from '@tabler/icons-react';
import { useCompanyDetailWithQuery } from '@/contacts/companies/hooks/useCompanyDetailWithQuery';
import { ContactDetailIdProvider } from '@/contacts/contexts/ContactDetailIdContext';
import { TCompany } from '@/contacts/types/companyType';
import { NumberField, ScrollArea, Spinner, Switch, TextField } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  CompanyEmails,
  CompanyPhones,
  SelectMember,
  TagsSelect,
  useCompaniesEdit,
  PANEL_TEXT_FIELD_CLASS_NAME,
  PanelDescriptionField,
  PanelField,
  PanelFieldTrigger,
  PrintDocument,
} from 'ui-modules';
import { PanelAvatarField } from './PanelAvatarField';

const SCOPE = 'side-panel-company';

type TPanelCompany = TCompany & { isSubscribed?: string };

type TTextCode =
  | 'primaryName'
  | 'code'
  | 'website'
  | 'location'
  | 'businessType';

/** Edits one company text field using the existing inline mutation flow. */
const CompanyTextField = ({
  company,
  code,
  placeholder,
}: {
  company: TPanelCompany;
  code: TTextCode;
  placeholder: string;
}) => {
  const { companiesEdit } = useCompaniesEdit();

  return (
    <TextField
      scope={`${SCOPE}.${code}`}
      value={company[code] || ''}
      placeholder={placeholder}
      className={PANEL_TEXT_FIELD_CLASS_NAME}
      onSave={(next) =>
        companiesEdit({ variables: { _id: company._id, [code]: next } })
      }
    >
      {!company[code] && (
        <IconForms
          className="size-3.5 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
      )}
    </TextField>
  );
};

const CompanyFields = () => {
  const { t } = useTranslation('contact', { keyPrefix: 'company' });
  const { companyDetail, loading } = useCompanyDetailWithQuery();
  const { companiesEdit } = useCompaniesEdit();

  if (loading && !companyDetail) {
    return <Spinner containerClassName="py-12" />;
  }

  if (!companyDetail) {
    return null;
  }

  const company: TPanelCompany = companyDetail;

  return (
    <div className="flex flex-col gap-0.5 p-3">
      <PanelAvatarField
        value={company.avatar || ''}
        onSave={(avatar) =>
          companiesEdit({ variables: { _id: company._id, avatar } })
        }
      />
      <div className="py-2">
        <PrintDocument
          items={[{ _id: company._id }]}
          contentType="core:contact.company"
        />
      </div>
      <PanelField icon={IconBuilding} label={t('field.primaryName', 'Name')}>
        <CompanyTextField
          company={company}
          code="primaryName"
          placeholder={t('field.primaryName', 'Name')}
        />
      </PanelField>
      <PanelField
        icon={IconTag}
        label={t('tags', 'Tags')}
        placeholder={!company.tagIds?.length ? t('tags', 'Tags') : undefined}
      >
        <TagsSelect.InlineCell
          type="core:company"
          mode="multiple"
          scope={`${SCOPE}.tags`}
          value={company.tagIds}
          targetIds={[company._id]}
          className="rounded-sm"
          options={(tagIds) => ({
            update: (cache) => {
              cache.modify({
                id: cache.identify({ __typename: 'Company', _id: company._id }),
                fields: { tagIds: () => tagIds },
                optimistic: true,
              });
            },
          })}
        />
      </PanelField>
      <PanelField icon={IconMail} label={t('emails', 'Emails')}>
        <CompanyEmails
          _id={company._id}
          primaryEmail={company.primaryEmail || ''}
          emails={company.emails || []}
          emailValidationStatus={company.emailValidationStatus}
          scope={`${SCOPE}.emails`}
          Trigger={PanelFieldTrigger}
        />
      </PanelField>
      <PanelField icon={IconPhone} label={t('phones', 'Phones')}>
        <CompanyPhones
          _id={company._id}
          primaryPhone={company.primaryPhone || ''}
          phones={company.phones || []}
          phoneValidationStatus={company.phoneValidationStatus}
          scope={`${SCOPE}.phones`}
          Trigger={PanelFieldTrigger}
        />
      </PanelField>
      <PanelField
        icon={IconUser}
        label={t('owner', 'Owner')}
        placeholder={!company.ownerId ? t('owner', 'Owner') : undefined}
      >
        <SelectMember.InlineCell
          scope={`${SCOPE}.owner`}
          value={company.ownerId}
          className="rounded-sm"
          onValueChange={(ownerId) =>
            companiesEdit({
              variables: { _id: company._id, ownerId: ownerId as string },
            })
          }
        />
      </PanelField>
      <PanelField icon={IconHash} label={t('code', 'Code')}>
        <CompanyTextField
          company={company}
          code="code"
          placeholder={t('code', 'Code')}
        />
      </PanelField>
      <PanelField icon={IconWorld} label={t('website', 'Website')}>
        <CompanyTextField
          company={company}
          code="website"
          placeholder={t('website', 'Website')}
        />
      </PanelField>
      <PanelField icon={IconMapPin} label={t('location', 'Location')}>
        <CompanyTextField
          company={company}
          code="location"
          placeholder={t('location', 'Location')}
        />
      </PanelField>
      <PanelField
        icon={IconBuildingFactory}
        label={t('business-type', 'Business type')}
      >
        <CompanyTextField
          company={company}
          code="businessType"
          placeholder={t('business-type', 'Business type')}
        />
      </PanelField>
      <PanelField icon={IconUsers} label={t('size', 'Size')}>
        <NumberField
          scope={`${SCOPE}.size`}
          value={company.size || 0}
          className={PANEL_TEXT_FIELD_CLASS_NAME}
          onSave={(size) =>
            companiesEdit({ variables: { _id: company._id, size } })
          }
        />
      </PanelField>
      <PanelField icon={IconBell} label={t('subscribed', 'Subscribed')}>
        <div className="flex h-7 items-center px-2">
          <Switch
            size="sm"
            checked={company.isSubscribed === 'Yes'}
            onCheckedChange={(checked) =>
              companiesEdit({
                variables: {
                  _id: company._id,
                  isSubscribed: checked ? 'Yes' : 'No',
                },
              })
            }
          />
        </div>
      </PanelField>
      <PanelDescriptionField
        label={t('description', 'Description')}
        value={company.description || ''}
        scope={`${SCOPE}.description`}
        onSave={(description) =>
          companiesEdit({ variables: { _id: company._id, description } })
        }
      />
    </div>
  );
};

// The company's fields as record table cells: click a value to edit it.
export const CompanyPanelDetail = ({ companyId }: { companyId: string }) => (
  <ContactDetailIdProvider value={companyId}>
    {/* Radix sizes its content as a table, which lets wide values push past
        the panel; a block lets each value shrink and truncate instead. */}
    <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
      <CompanyFields />
    </ScrollArea>
  </ContactDetailIdProvider>
);
