import type { Company } from '@erxes/core-contract';
import {
  IconBriefcase,
  IconBuildingFactory,
  IconHash,
  IconUsers,
  IconWorld,
} from '@tabler/icons-react';
import { cn, NumberField, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useCompany, useCompanyEdit } from '~/modules/contacts/companies/useCompanies';
import { LeadPanelSection } from '~/modules/leads/LeadPanelSection';
import { LeadStageField } from '~/modules/leads/LeadStageField';
import { PANEL_TEXT_FIELD_CLASS_NAME, PanelField } from '../PanelField';
import { usePanelExpanded } from '../RecordSidePanel';
import {
  ContactChannelsSection,
  ContactDetailScroll,
  ContactOwnerField,
  ContactTextField,
} from './ContactDetailFields';
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

/** One text field of the company, with its label, saved without touching the others. */
const CompanyTextRow = ({
  company,
  code,
  label,
}: {
  company: Company;
  code: TTextCode;
  label: string;
}) => {
  const edit = useCompanyEdit();

  return (
    <PanelField icon={TEXT_FIELD_ICONS[code]} label={label}>
      <ContactTextField
        scope={`${SCOPE}.${code}`}
        value={company[code] || ''}
        placeholder={label}
        icon={TEXT_FIELD_ICONS[code]}
        onSave={(next) => edit.mutate({ id: company.id, [code]: next })}
      />
    </PanelField>
  );
};

/** Business type, industries and size. */
const CompanyBusinessSection = ({ company }: { company: Company }) => {
  const { t } = useTranslation('contact', { keyPrefix: 'company' });
  const { t: sectionT } = useTranslation('common', { keyPrefix: 'side-panel' });
  const edit = useCompanyEdit();
  const noSize = company.size == null;

  return (
    <ContactDetailSection title={sectionT('business', 'Business')} nested>
      <CompanyTextRow
        company={company}
        code="businessType"
        label={t('field.businessType', 'Business type')}
      />
      <CompanyTextRow company={company} code="industry" label={t('field.industry', 'Industries')} />
      <PanelField icon={IconUsers} label={t('field.size', 'Size')}>
        <NumberField
          scope={`${SCOPE}.size`}
          value={company.size ?? 0}
          formatValue={(value) => (noSize ? t('field.size', 'Size') : value.toLocaleString())}
          className={cn(PANEL_TEXT_FIELD_CLASS_NAME, noSize && 'text-muted-foreground')}
          onSave={(size) => {
            if (size !== company.size) edit.mutate({ id: company.id, size });
          }}
        >
          {noSize && (
            <IconUsers className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
          )}
        </NumberField>
      </PanelField>
    </ContactDetailSection>
  );
};

/** The company's fields as record table cells. */
const CompanyFields = ({ company }: { company: Company }) => {
  const expanded = usePanelExpanded();
  const { t } = useTranslation('contact', { keyPrefix: 'company' });
  const { t: sectionT } = useTranslation('common', { keyPrefix: 'side-panel' });
  const edit = useCompanyEdit();

  return (
    <div className="border-b px-3 pb-2">
      <ContactDetailSection title={sectionT('general', 'General')} nested>
        <ContactOwnerField
          label={t('owner', 'Owner')}
          scope={`${SCOPE}.owner`}
          ownerId={company.ownerId}
          onChange={(ownerId) => edit.mutate({ id: company.id, ownerId })}
        />
        <CompanyTextRow company={company} code="code" label={t('field.code', 'Code')} />
        <LeadStageField recordType="company" record={company} />
        <CompanyTextRow company={company} code="website" label={t('field.website', 'Website')} />
      </ContactDetailSection>
      <CompanyBusinessSection company={company} />
      <ContactChannelsSection
        title={sectionT('contact', 'Contact')}
        labels={{ emails: t('emails', 'Emails'), phones: t('phones', 'Phones') }}
        scope={SCOPE}
        contact={company}
        onSave={(value) => edit.mutate({ id: company.id, ...value })}
      />
      {!expanded && (
        <ContactDescriptionField
          contentType="core:company"
          contentId={company.id}
          value={company.description || ''}
        />
      )}
    </div>
  );
};

// The company's fields as record table cells: click a value to edit it.
export const CompanyPanelDetail = ({ companyId }: { companyId: string }) => {
  const { data: company, isPending } = useCompany(companyId);

  if (isPending) return <Spinner containerClassName="py-12" />;

  if (!company) return null;

  return (
    <ContactDetailScroll>
      <CompanyFields company={company} />
      <LeadPanelSection recordType="company" record={company} />
      <ContactPanelTags contentType="core:company" contentId={company.id} tagIds={company.tagIds} />
      <ContactPanelRelationField contentType="core:company" contentId={company.id} />
    </ContactDetailScroll>
  );
};
