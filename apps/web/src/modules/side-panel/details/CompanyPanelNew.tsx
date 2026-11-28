import { zodResolver } from '@hookform/resolvers/zod';
import {
  type Icon,
  IconBriefcase,
  IconBuilding,
  IconBuildingFactory,
  IconHash,
  IconMail,
  IconPhone,
  IconUser,
  IconUsers,
  IconWorld,
} from '@tabler/icons-react';
import {
  ContactRelationInput,
  Form,
  Input,
  MultipleSelector,
  Select,
  useToast,
  PanelFormRow,
} from 'erxes-ui';
import { useState } from 'react';
import { useForm, useFormContext, type UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import {
  contactQueries,
  contactSearchQueries,
  isApiError,
  messageOf,
} from '@erxes/core-contract/client';
import {
  COMPANY_BUSINESS_TYPES,
  DEFAULT_COMPANY_INDUSTRY_TYPES,
} from '~/modules/contacts/companies/companyConstants';
import { useCompanyCreate } from '~/modules/contacts/companies/useCompanies';
import { CreateValues, useCreateValues } from '~/modules/dataExtensions/form/CreateValues';
import { isValuesError } from '~/modules/dataExtensions/values';
import { useContactDraft } from '../useSidePanel';
import {
  ContactAvatarRow,
  ContactDescriptionRow,
  ContactOwnerRow,
  type ContactDescription,
  NewContactForm,
  useContactDescription,
  useFinishCreate,
} from './NewContactForm';

const INDUSTRY_OPTIONS = DEFAULT_COMPANY_INDUSTRY_TYPES.filter(Boolean).map((industry) => ({
  label: industry,
  value: industry,
}));

type Translate = (key: string, defaultValue: string) => string;

/** `t` reads `contact:company.*`. */
const companySchema = (t: Translate, description: ContactDescription) =>
  z.object({
    // Core names every company.
    primaryName: z
      .string()
      .trim()
      .min(1, t('form.company-name-required', 'Enter the company name')),
    code: z.string().optional(),
    ownerId: z.string().optional(),
    primaryEmail: z
      .email(t('form.email-invalid', 'Enter an email like name@example.com'))
      .optional()
      .or(z.literal('')),
    primaryPhone: z.string().optional(),
    website: z.string().optional(),
    industry: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
    businessType: z.string().optional(),
    size: z
      .string()
      .regex(/^\d*$/, t('form.size-invalid', 'Enter a whole number of people'))
      .optional(),
    description: description.optional(),
    avatarUrl: z.string().nullable().optional(),
  });

type TCompanyForm = z.infer<ReturnType<typeof companySchema>>;

type TCompanyTextField = 'primaryName' | 'code' | 'primaryEmail' | 'primaryPhone' | 'website';

const TEXT_FIELD_ICONS: Record<TCompanyTextField, Icon> = {
  primaryName: IconBuilding,
  code: IconHash,
  primaryEmail: IconMail,
  primaryPhone: IconPhone,
  website: IconWorld,
};

// The keyboard each field gets on a phone, and the browser's checks.
const TEXT_FIELD_TYPES: Partial<Record<TCompanyTextField, 'email' | 'tel' | 'url'>> = {
  primaryEmail: 'email',
  primaryPhone: 'tel',
  website: 'url',
};

const orNull = (value?: string) => value?.trim() || null;

/** A registered text input with its field label and validation error. */
const TextRow = ({
  name,
  label,
  required,
}: {
  name: TCompanyTextField;
  label: string;
  required?: boolean;
}) => {
  const { register, formState } = useFormContext<TCompanyForm>();

  return (
    <PanelFormRow
      icon={TEXT_FIELD_ICONS[name]}
      label={label}
      required={required}
      error={formState.errors[name]?.message}
    >
      <Input
        {...register(name)}
        type={TEXT_FIELD_TYPES[name]}
        placeholder={label}
        variant="bordered"
        text="sm"
      />
    </PanelFormRow>
  );
};

/** Industries, business type and size. */
const BusinessRows = () => {
  const { t } = useTranslation('contact', { keyPrefix: 'company' });
  const { control, register, formState } = useFormContext<TCompanyForm>();

  return (
    <>
      <PanelFormRow icon={IconBuildingFactory} label={t('field.industry', 'Industries')}>
        <Form.Field
          control={control}
          name="industry"
          render={({ field }) => (
            <MultipleSelector
              placeholder={t('field.industry', 'Industries')}
              hidePlaceholderWhenSelected
              options={INDUSTRY_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              className="min-h-7"
            />
          )}
        />
      </PanelFormRow>
      <PanelFormRow icon={IconBriefcase} label={t('field.businessType', 'Business type')}>
        <Form.Field
          control={control}
          name="businessType"
          render={({ field }) => (
            <Select value={field.value || ''} onValueChange={field.onChange}>
              <Select.Trigger variant="bordered">
                <Select.Value placeholder={t('field.businessType', 'Business type')} />
              </Select.Trigger>
              <Select.Content>
                {COMPANY_BUSINESS_TYPES.filter(Boolean).map((type) => (
                  <Select.Item key={type} value={type}>
                    {type}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          )}
        />
      </PanelFormRow>
      <PanelFormRow
        icon={IconUsers}
        label={t('field.size', 'Size')}
        error={formState.errors.size?.message}
      >
        <Input
          {...register('size')}
          inputMode="numeric"
          placeholder={t('field.size-placeholder', 'Employees')}
          variant="bordered"
          text="sm"
        />
      </PanelFormRow>
    </>
  );
};

/** Creates the company and links the customers picked in the draft. */
const useCompanySave = (
  form: UseFormReturn<TCompanyForm>,
  customerIds: string[],
  data: ReturnType<typeof useCreateValues>,
) => {
  const { t } = useTranslation('contact', { keyPrefix: 'company' });
  const { state, leadStageId } = useContactDraft('core:company');
  const { toast } = useToast();
  const create = useCompanyCreate();
  const { linking, finish } = useFinishCreate('core:company', 'Could not link customers');

  const save = async ({ industry, size, primaryName, ...values }: TCompanyForm) => {
    try {
      const created = await create.mutateAsync({
        primaryName: primaryName.trim(),
        state: state || 'customer',
        ...(state === 'lead' && leadStageId ? { leadStageId } : {}),
        code: orNull(values.code),
        ownerId: values.ownerId || null,
        primaryEmail: orNull(values.primaryEmail),
        primaryPhone: orNull(values.primaryPhone),
        website: orNull(values.website),
        // Core keeps industries as one text.
        industry: industry?.length ? industry.map((option) => option.value).join(', ') : null,
        businessType: values.businessType || null,
        size: size ? Number(size) : null,
        description: values.description || null,
        avatarUrl: values.avatarUrl || null,
        values: data.values,
      });

      await finish(created.id, customerIds);
    } catch (error) {
      if (isValuesError(error)) {
        data.failed(error);

        return;
      }

      if (isApiError(error, 'TAKEN')) {
        form.setError('primaryName', { message: error.message });

        return;
      }

      toast({
        variant: 'destructive',
        title: t('error-title', 'Error'),
        description: messageOf(error),
      });
    }
  };

  return { save, saving: create.isPending || linking };
};

/**
 * A company not created yet, drawn like its Detail tab: nothing saved until
 * Save; the company then replaces the draft. Cancel leaves nothing behind.
 */
export const CompanyPanelNew = () => {
  const { t } = useTranslation('contact', { keyPrefix: 'company' });
  const description = useContactDescription();
  const [customerIds, setCustomerIds] = useState<string[]>([]);

  const form = useForm<TCompanyForm>({
    resolver: zodResolver(companySchema(t, description)),
    defaultValues: { primaryName: '', code: '', industry: [] },
  });

  const data = useCreateValues('core.company');
  const { save, saving } = useCompanySave(form, customerIds, data);

  return (
    <NewContactForm
      form={form}
      onSave={save}
      saving={saving}
      saveLabel={t('add.create', 'Create company')}
    >
      <ContactAvatarRow label={t('field.picture', 'Picture')} />
      <TextRow name="primaryName" label={t('field.primaryName', 'Name')} required />
      <TextRow name="code" label={t('field.code', 'Code')} />
      <PanelFormRow icon={IconUser} label={t('customer', 'Customer')}>
        <ContactRelationInput
          kind="customer"
          value={customerIds}
          onValueChange={setCustomerIds}
          contacts={contactQueries}
          contactSearch={contactSearchQueries}
          scope="side-panel-company-new.customers"
          disabled={saving}
        />
      </PanelFormRow>
      <TextRow name="primaryEmail" label={t('field.email', 'Email')} />
      <TextRow name="primaryPhone" label={t('field.phone', 'Phone')} />
      <ContactOwnerRow label={t('owner', 'Owner')} />
      <TextRow name="website" label={t('field.website', 'Website')} />
      <BusinessRows />
      <ContactDescriptionRow
        label={t('field.description', 'Description')}
        scope="side-panel-company-new.description"
      />
      <CreateValues asked={data.asked} draft={data.draft} disabled={saving} />
    </NewContactForm>
  );
};
