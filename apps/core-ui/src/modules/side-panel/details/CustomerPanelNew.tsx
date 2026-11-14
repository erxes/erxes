import { CustomerExists, CustomerSex } from '@erxes/core-contract';
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
import { DatePicker, Form, Input, Select, useToast } from 'erxes-ui';
import { useState } from 'react';
import { useForm, useFormContext, type UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { toYmd } from '~/components/inlineCells';
import { errorData, isApiError, messageOf } from '~/lib/api';
import { useCustomerCreate } from '~/modules/contacts/customers/useCustomers';
import { PanelFormRow } from '../PanelForm';
import { useSidePanelDraft } from '../useSidePanel';
import { ContactRelationInput } from './ContactRelationInput';
import {
  ContactAvatarRow,
  ContactDescriptionRow,
  ContactOwnerRow,
  contactDescription,
  NewContactForm,
  useFinishCreate,
} from './NewContactForm';

// The ISO/IEC 5218 codes core stores.
const CUSTOMER_SEX_OPTIONS = [
  { label: 'Not known', value: '0' },
  { label: 'Male', value: '1' },
  { label: 'Female', value: '2' },
  { label: 'Not applicable', value: '9' },
];

const customerSchema = z
  .object({
    firstName: z.string(),
    middleName: z.string(),
    lastName: z.string(),
    primaryEmail: z.union([z.literal(''), z.email('Invalid email format')]),
    primaryPhone: z.string(),
    ownerId: z.string(),
    code: z.string(),
    position: z.string(),
    sex: CustomerSex.nullable(),
    birthDate: z.date().nullable(),
    description: contactDescription,
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
    { path: ['firstName'], error: 'Fill in a name, an e-mail or a phone' },
  );

type TCustomerForm = z.infer<typeof customerSchema>;

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
      <Input {...register(code)} placeholder={label} variant="bordered" text="sm" />
    </PanelFormRow>
  );
};

const SexRow = () => {
  const { t } = useTranslation('contact', { keyPrefix: 'customer.add' });
  const { control } = useFormContext<TCustomerForm>();

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
              {CUSTOMER_SEX_OPTIONS.map((option) => (
                <Select.Item key={option.value} value={option.value} className="h-7">
                  {option.label}
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
const useCustomerSave = (form: UseFormReturn<TCustomerForm>, companyIds: string[]) => {
  const { t } = useTranslation('contact', { keyPrefix: 'customer' });
  const { state, leadStageId } = useSidePanelDraft('core:customer');
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
        birthDate: values.birthDate ? toYmd(values.birthDate) : null,
        description: values.description || null,
        avatarUrl: values.avatarUrl || null,
      });

      await finish(created.id, companyIds);
    } catch (error) {
      if (isApiError(error, 'CUSTOMER_EXISTS')) {
        form.setError(errorData(error, CustomerExists)?.field ?? 'primaryEmail', {
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
  const [companyIds, setCompanyIds] = useState<string[]>([]);

  const form = useForm<TCustomerForm>({
    resolver: zodResolver(customerSchema),
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

  const { save, saving, isLead } = useCustomerSave(form, companyIds);

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
    </NewContactForm>
  );
};
