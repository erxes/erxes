import { ContactPanelTags } from '@/side-panel/components/details/ContactPanelTags';
import { ContactDescriptionField } from '@/side-panel/components/details/ContactPanelDescription';
import { ContactDetailSection } from '@/side-panel/components/details/ContactDetailSection';
import { ContactPanelRelationField } from '@/side-panel/components/details/ContactPanelRelationField';
import {
  IconBell,
  IconBuildingFactory,
  IconHash,
  IconMail,
  IconMapPin,
  IconPhone,
  IconUser,
  IconUsers,
  IconWorld,
} from '@tabler/icons-react';
import { useCompanyDetailWithQuery } from '@/contacts/companies/hooks/useCompanyDetailWithQuery';
import { ContactDetailIdProvider } from '@/contacts/contexts/ContactDetailIdContext';
import { TCompany } from '@/contacts/types/companyType';
import {
  cn,
  NumberField,
  ScrollArea,
  Spinner,
  Switch,
  TextField,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ReactNode, useId } from 'react';
import {
  CompanyEmails,
  CompanyPhones,
  SelectMember,
  useCompaniesEdit,
  usePanelExpanded,
  PANEL_TEXT_FIELD_CLASS_NAME,
  PanelField,
  PanelFieldTrigger,
} from 'ui-modules';

const SCOPE = 'side-panel-company';

type TPanelCompany = TCompany & { isSubscribed?: string };

type TTextCode = 'code' | 'website' | 'location' | 'businessType';

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
  const Icon = {
    code: IconHash,
    website: IconWorld,
    location: IconMapPin,
    businessType: IconBuildingFactory,
  }[code];

  return (
    <TextField
      scope={`${SCOPE}.${code}`}
      value={company[code] || ''}
      placeholder={placeholder}
      className={cn(
        PANEL_TEXT_FIELD_CLASS_NAME,
        !company[code] && 'text-muted-foreground',
      )}
      onSave={(next) =>
        companiesEdit({ variables: { _id: company._id, [code]: next } })
      }
    >
      {!company[code] && (
        <Icon
          className="size-3.5 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
      )}
    </TextField>
  );
};

/** Edits company fields through the contact mutation hooks. */
const CompanyFields = () => {
  const expanded = usePanelExpanded();
  const ownerControlId = useId();
  const { t } = useTranslation('contact', { keyPrefix: 'company' });
  const { t: sectionT } = useTranslation('common', { keyPrefix: 'side-panel' });
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
    <div>
      <div className="border-b px-3 pb-2">
        <ContactDetailSection title={sectionT('general', 'General')} nested>
          <PanelField
            icon={IconUser}
            label={t('owner', 'Owner')}
            htmlFor={ownerControlId}
            placeholder={!company.ownerId ? t('owner', 'Owner') : undefined}
          >
            <SelectMember.InlineCell
              id={ownerControlId}
              scope={`${SCOPE}.owner`}
              value={company.ownerId}
              placeholder={company.ownerId ? t('owner', 'Owner') : ''}
              showInactive
              className="rounded-sm"
              onValueChange={(ownerId) =>
                companiesEdit({
                  variables: {
                    _id: company._id,
                    ownerId: typeof ownerId === 'string' ? ownerId : '',
                  },
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
        </ContactDetailSection>
        <ContactDetailSection title={sectionT('business', 'Business')} nested>
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
              value={company.size ?? 0}
              formatValue={(value) =>
                company.size == null
                  ? t('size', 'Size')
                  : value.toLocaleString()
              }
              className={cn(
                PANEL_TEXT_FIELD_CLASS_NAME,
                company.size == null && 'text-muted-foreground',
              )}
              onSave={(size) =>
                companiesEdit({ variables: { _id: company._id, size } })
              }
            >
              {company.size == null && (
                <IconUsers
                  className="size-3.5 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
              )}
            </NumberField>
          </PanelField>
        </ContactDetailSection>
        <ContactDetailSection title={sectionT('contact', 'Contact')} nested>
          <PanelField
            icon={IconMail}
            label={t('emails', 'Emails')}
            placeholder={
              !company.primaryEmail && !company.emails?.some(Boolean)
                ? t('emails', 'Emails')
                : undefined
            }
          >
            <CompanyEmails
              maxVisible={1}
              _id={company._id}
              primaryEmail={company.primaryEmail || ''}
              emails={company.emails || []}
              emailValidationStatus={company.emailValidationStatus}
              scope={`${SCOPE}.emails`}
              Trigger={PanelFieldTrigger}
            />
          </PanelField>
          <PanelField
            icon={IconPhone}
            label={t('phones', 'Phones')}
            placeholder={
              !company.primaryPhone && !company.phones?.some(Boolean)
                ? t('phones', 'Phones')
                : undefined
            }
          >
            <CompanyPhones
              maxVisible={1}
              _id={company._id}
              primaryPhone={company.primaryPhone || ''}
              phones={company.phones || []}
              phoneValidationStatus={company.phoneValidationStatus}
              scope={`${SCOPE}.phones`}
              Trigger={PanelFieldTrigger}
            />
          </PanelField>
          <PanelField icon={IconMapPin} label={t('location', 'Location')}>
            <CompanyTextField
              company={company}
              code="location"
              placeholder={t('location', 'Location')}
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
        </ContactDetailSection>
        {!expanded && (
          <ContactDescriptionField
            contentType="core:company"
            contentId={company._id}
            value={company.description || ''}
          />
        )}
      </div>
      <ContactPanelTags
        contentType="core:company"
        contentId={company._id}
        tagIds={company.tagIds}
      />
      <ContactPanelRelationField
        contentType="core:company"
        contentId={company._id}
      />
    </div>
  );
};

// The company's fields as record table cells: click a value to edit it.
export const CompanyPanelDetail = ({
  companyId,
  children,
}: {
  companyId: string;
  /** Sections drawn under the company's own fields, such as custom fields. */
  children?: ReactNode;
}) => (
  <ContactDetailIdProvider value={companyId}>
    {/* Radix sizes its content as a table, which lets wide values push past
        the panel; a block lets each value shrink and truncate instead. */}
    <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
      <CompanyFields />
      {children}
    </ScrollArea>
  </ContactDetailIdProvider>
);
