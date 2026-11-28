import { CustomerSex } from '@erxes/core-contract';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  type Icon,
  IconBriefcase,
  IconBuilding,
  IconCalendar,
  IconGenderBigender,
  IconHash,
  IconMail,
  IconPhone,
  IconUser,
} from '@tabler/icons-react';
import {
  ContactRelationInput,
  DatePicker,
  Form,
  Input,
  Select,
  SexCode,
  useSexLabels,
  useToast,
  toIsoDay,
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
import { useCustomerCreate } from '~/modules/contacts/customers/useCustomers';
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

// The ISO/IEC 5218 codes core stores.
const SEX_CODES = [SexCode.NOT_KNOWN, SexCode.MALE, SexCode.FEMALE, SexCode.NOT_APPLICABLE];

type Translate = (key: string, defaultValue: string) => string;

/** `t` reads `contact:customer.*`. */
const customerSchema = (t: Translate, description: ContactDescription) =>
  z
    .object({
      firstName: z.string(),
      middleName: z.string(),
      lastName: z.string(),
      primaryEmail: z.union([
        z.literal(''),
        z.email(t('form.email-invalid', 'Enter an email like name@example.com')),
      ]),
      primaryPhone: z.string(),
      ownerId: z.string(),
      code: z.string(),
      position: z.string(),
      sex: CustomerSex.nullable(),
      birthDate: z.date().nullable(),
      description,
      avatarUrl: z.string().nullable(),
    })
    .refine(
      (values) =>
        Boolean(
          values.firstName.trim() ||
          values.lastName.trim() ||
          values.primaryEmail ||
          values.primaryPhone.trim(),
        ),
      {
        path: ['firstName'],
        error: t('form.name-or-contact', 'Fill in a name, an email or a phone'),
      },
    );

type TCustomerForm = z.infer<ReturnType<typeof customerSchema>>;

type TTextCode =
  | 'firstName'
  | 'middleName'
  | 'lastName'
  | 'primaryEmail'
  | 'primaryPhone'
  | 'code'
  | 'position';

const TEXT_FIELD_ICONS: Record<TTextCode, Icon> = {
  firstName: IconUser,
  middleName: IconUser,
  lastName: IconUser,
  primaryEmail: IconMail,
  primaryPhone: IconPhone,
  code: IconHash,
  position: IconBriefcase,
};

// The keyboard and the browser's checks each field gets; the contact's, not the member's, so no autofill.
const TEXT_FIELD_TYPES: Partial<Record<TTextCode, 'email' | 'tel'>> = {
  primaryEmail: 'email',
  primaryPhone: 'tel',
};

const orNull = (value: string) => value.trim() || null;

/** A registered text input with its field label and validation error. */
const TextRow = ({ code, label }: { code: TTextCode; label: string }) => {
  const { register, formState } = useFormContext<TCustomerForm>();

  return (
    <PanelFormRow
      icon={TEXT_FIELD_ICONS[code]}
      label={label}
      error={formState.errors[code]?.message}
    >
      <Input
        {...register(code)}
        type={TEXT_FIELD_TYPES[code]}
        placeholder={label}
        variant="bordered"
        text="sm"
      />
    </PanelFormRow>
  );
};

const SexRow = () => {
  const { t } = useTranslation('contact', { keyPrefix: 'customer.add' });
  const { control } = useFormContext<TCustomerForm>();
  const labels = useSexLabels();

  return (
    <PanelFormRow icon={IconGenderBigender} label={t('pronoun', 'Pronoun')}>
      <Form.Field
        control={control}
        name="sex"
        render={({ field }) => (
          <Select
            value={String(field.value ?? 0)}
            onValueChange={(value) => field.onChange(Number(value))}
          >
            <Select.Trigger variant="bordered" aria-label={t('pronoun', 'Pronoun')}>
              <Select.Value placeholder={t('pronoun', 'Pronoun')} />
            </Select.Trigger>
            <Select.Content align="start">
              {SEX_CODES.map((code) => (
                <Select.Item key={code} value={String(code)} className="h-7">
                  {labels[code]}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        )}
      />
    </PanelFormRow>
  );
};

const BirthDateRow = () => {
  const { t } = useTranslation('contact', { keyPrefix: 'customer.add' });
  const { control, formState } = useFormContext<TCustomerForm>();

  return (
    <PanelFormRow
      icon={IconCalendar}
      label={t('birth-date', 'Birth date')}
      error={formState.errors.birthDate?.message}
    >
      <Form.Field
        control={control}
        name="birthDate"
        render={({ field }) => (
          <DatePicker
            placeholder="YYYY/MM/DD"
            value={field.value ?? undefined}
            defaultMonth={field.value ?? undefined}
            onChange={(date) => field.onChange(date instanceof Date ? date : null)}
          />
        )}
      />
    </PanelFormRow>
  );
};

/** Creates the customer (or lead) and links the companies picked in the draft. */
const useCustomerSave = (
  form: UseFormReturn<TCustomerForm>,
  companyIds: string[],
  data: ReturnType<typeof useCreateValues>,
) => {
  const { t } = useTranslation('contact', { keyPrefix: 'customer' });
  const { state, leadStageId } = useContactDraft('core:customer');
  const { toast } = useToast();
  const create = useCustomerCreate();
  const { linking, finish } = useFinishCreate('core:customer', 'Could not link companies');

  const save = async (values: TCustomerForm) => {
    try {
      const created = await create.mutateAsync({
        state: state ?? 'customer',
        ...(state === 'lead' && leadStageId ? { leadStageId } : {}),
        firstName: orNull(values.firstName),
        middleName: orNull(values.middleName),
        lastName: orNull(values.lastName),
        primaryEmail: orNull(values.primaryEmail),
        primaryPhone: orNull(values.primaryPhone),
        ownerId: values.ownerId || null,
        code: orNull(values.code),
        position: orNull(values.position),
        sex: values.sex ?? 0,
        birthDate: values.birthDate ? toIsoDay(values.birthDate) : null,
        description: values.description || null,
        avatarUrl: values.avatarUrl || null,
        values: data.values,
      });

      await finish(created.id, companyIds);
    } catch (error) {
      if (isValuesError(error)) {
        data.failed(error);

        return;
      }

      if (isApiError(error, 'TAKEN')) {
        form.setError(error.data.field === 'primaryPhone' ? 'primaryPhone' : 'primaryEmail', {
          message: error.message,
        });

        return;
      }

      toast({
        variant: 'destructive',
        title: t('error-title', 'Error'),
        description: messageOf(error),
      });
    }
  };

  return { save, saving: create.isPending || linking, isLead: state === 'lead' };
};

/**
 * A customer (or lead, `defaults.state`) not created yet, drawn like its
 * Detail tab: nothing saved until Save. The customer then replaces the
 * draft; Cancel leaves nothing behind.
 */
export const CustomerPanelNew = () => {
  const { t } = useTranslation('contact', { keyPrefix: 'customer' });
  const { t: addT } = useTranslation('contact', { keyPrefix: 'customer.add' });
  const description = useContactDescription();
  const [companyIds, setCompanyIds] = useState<string[]>([]);

  const form = useForm<TCustomerForm>({
    resolver: zodResolver(customerSchema(t, description)),
    defaultValues: {
      firstName: '',
      middleName: '',
      lastName: '',
      primaryEmail: '',
      primaryPhone: '',
      ownerId: '',
      code: '',
      position: '',
      sex: null,
      birthDate: null,
      description: '',
      avatarUrl: null,
    },
  });

  const data = useCreateValues('core.customer');
  const { save, saving, isLead } = useCustomerSave(form, companyIds, data);

  return (
    <NewContactForm
      form={form}
      onSave={save}
      saving={saving}
      saveLabel={isLead ? addT('create-lead', 'Create lead') : addT('create', 'Create customer')}
    >
      <ContactAvatarRow label={addT('picture', 'Picture')} />
      <TextRow code="firstName" label={addT('first-name', 'First name')} />
      <TextRow code="middleName" label={addT('middle-name', 'Middle name')} />
      <TextRow code="lastName" label={addT('last-name', 'Last name')} />
      <PanelFormRow icon={IconBuilding} label={t('company', 'Company')}>
        <ContactRelationInput
          kind="company"
          value={companyIds}
          onValueChange={setCompanyIds}
          contacts={contactQueries}
          contactSearch={contactSearchQueries}
          scope="side-panel-customer-new.companies"
          disabled={saving}
        />
      </PanelFormRow>
      <TextRow code="primaryEmail" label={addT('email', 'Email')} />
      <TextRow code="primaryPhone" label={addT('phone', 'Phone')} />
      <ContactOwnerRow label={t('owner', 'Owner')} />
      <TextRow code="code" label={addT('code', 'Code')} />
      <TextRow code="position" label={t('position', 'Position')} />
      <SexRow />
      <BirthDateRow />
      <ContactDescriptionRow
        label={addT('description', 'Description')}
        scope="side-panel-customer-new.description"
      />
      <CreateValues asked={data.asked} draft={data.draft} disabled={saving} />
    </NewContactForm>
  );
};
