import type { Company } from '@erxes/core-contract';
import {
  IconBuildingFactory,
  IconBriefcase,
  IconHash,
  IconMail,
  IconPhone,
  IconUser,
  IconUsers,
  IconWorld,
} from '@tabler/icons-react';
import { cn, NumberField, ScrollArea, Spinner, TextField } from 'erxes-ui';
import { type ReactNode, useId } from 'react';
import { useTranslation } from 'react-i18next';
import { useCompany, useCompanyEdit } from '~/modules/contacts/companies/useCompanies';
import { ContactEmails, ContactPhones } from '~/modules/contacts/components/ContactFields';
import { SelectMember } from '~/modules/contacts/components/SelectMember';
import { PANEL_TEXT_FIELD_CLASS_NAME, PanelField, PanelFieldTrigger } from '../PanelField';
import { usePanelExpanded } from '../RecordSidePanel';
import { ContactDetailSection } from './ContactDetailSection';
import { ContactDescriptionField } from './ContactPanelDescription';
import { ContactPanelRelationField } from './ContactPanelRelationField';
import { ContactPanelTags } from './ContactPanelTags';

const SCOPE = 'side-panel-company';

type TTextCode = 'code' | 'website' | 'businessType' | 'industry';

const TEXT_FIELD_ICONS: Record<TTextCode, typeof IconHash> = {
  code: IconHash,
  website: IconWorld,
  businessType: IconBriefcase,
  industry: IconBuildingFactory,
};

/** Edits one company text field without touching the others. */
const CompanyTextField = ({ company, code, placeholder }: { company: Company; code: TTextCode; placeholder: string }) => {
  const edit = useCompanyEdit();
  const value = company[code] || '';
  const Icon = TEXT_FIELD_ICONS[code];

  return (
    <TextField
      scope={`${SCOPE}.${code}`}
      value={value}
      placeholder={placeholder}
      className={cn(PANEL_TEXT_FIELD_CLASS_NAME, !value && 'text-muted-foreground')}
      onSave={(next) => {
        if (next.trim() !== value) edit.mutate({ id: company.id, [code]: next.trim() || null });
      }}
    >
      {!value && <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />}
    </TextField>
  );
};

/** The company's fields as record table cells. */
const CompanyFields = ({ companyId }: { companyId: string }) => {
  const expanded = usePanelExpanded();
  const ownerControlId = useId();
  const { t } = useTranslation('contact', { keyPrefix: 'company' });
  const { t: sectionT } = useTranslation('common', { keyPrefix: 'side-panel' });
  const { data: company, isPending } = useCompany(companyId);
  const edit = useCompanyEdit();

  if (isPending) {
    return <Spinner containerClassName="py-12" />;
  }

  if (!company) {
    return null;
  }

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
              className="rounded-sm"
              onValueChange={(ownerId) =>
                edit.mutate({ id: company.id, ownerId: typeof ownerId === 'string' ? ownerId : null })
              }
            />
          </PanelField>
          <PanelField icon={IconHash} label={t('field.code', 'Code')}>
            <CompanyTextField company={company} code="code" placeholder={t('field.code', 'Code')} />
          </PanelField>
          <PanelField icon={IconWorld} label={t('field.website', 'Website')}>
            <CompanyTextField company={company} code="website" placeholder={t('field.website', 'Website')} />
          </PanelField>
        </ContactDetailSection>
        <ContactDetailSection title={sectionT('business', 'Business')} nested>
          <PanelField icon={IconBriefcase} label={t('field.businessType', 'Business type')}>
            <CompanyTextField
              company={company}
              code="businessType"
              placeholder={t('field.businessType', 'Business type')}
            />
          </PanelField>
          <PanelField icon={IconBuildingFactory} label={t('field.industry', 'Industries')}>
            <CompanyTextField company={company} code="industry" placeholder={t('field.industry', 'Industries')} />
          </PanelField>
          <PanelField icon={IconUsers} label={t('field.size', 'Size')}>
            <NumberField
              scope={`${SCOPE}.size`}
              value={company.size ?? 0}
              formatValue={(value) => (company.size == null ? t('field.size', 'Size') : value.toLocaleString())}
              className={cn(PANEL_TEXT_FIELD_CLASS_NAME, company.size == null && 'text-muted-foreground')}
              onSave={(size) => {
                if (size !== company.size) edit.mutate({ id: company.id, size });
              }}
            >
              {company.size == null && (
                <IconUsers className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
              )}
            </NumberField>
          </PanelField>
        </ContactDetailSection>
        <ContactDetailSection title={sectionT('contact', 'Contact')} nested>
          <PanelField
            icon={IconMail}
            label={t('emails', 'Emails')}
            placeholder={!company.primaryEmail && !company.emails.some(Boolean) ? t('emails', 'Emails') : undefined}
          >
            <ContactEmails
              maxVisible={1}
              id={company.id}
              primaryEmail={company.primaryEmail}
              emails={company.emails}
              scope={`${SCOPE}.emails`}
              Trigger={PanelFieldTrigger}
              onSave={(value) => edit.mutate({ id: company.id, ...value })}
            />
          </PanelField>
          <PanelField
            icon={IconPhone}
            label={t('phones', 'Phones')}
            placeholder={!company.primaryPhone && !company.phones.some(Boolean) ? t('phones', 'Phones') : undefined}
          >
            <ContactPhones
              maxVisible={1}
              id={company.id}
              primaryPhone={company.primaryPhone}
              phones={company.phones}
              scope={`${SCOPE}.phones`}
              Trigger={PanelFieldTrigger}
              onSave={(value) => edit.mutate({ id: company.id, ...value })}
            />
          </PanelField>
        </ContactDetailSection>
        {!expanded && (
          <ContactDescriptionField contentType="core:company" contentId={company.id} value={company.description || ''} />
        )}
      </div>
      <ContactPanelTags contentType="core:company" contentId={company.id} tagIds={company.tagIds} />
      <ContactPanelRelationField contentType="core:company" contentId={company.id} />
    </div>
  );
};

// The company's fields as record table cells: click a value to edit it.
export const CompanyPanelDetail = ({ companyId, children }: { companyId: string; children?: ReactNode }) => (
  // Radix sizes its content as a table, which lets wide values push past the
  // panel; a block lets each value shrink and truncate instead.
  <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
    <CompanyFields companyId={companyId} />
    {children}
  </ScrollArea>
);
