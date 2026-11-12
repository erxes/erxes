import type { Customer } from '@erxes/core-contract';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  type Icon,
  IconAlignLeft,
  IconBriefcase,
  IconBuilding,
  IconCalendar,
  IconGenderBigender,
  IconHash,
  IconMail,
  IconPhone,
  IconPhoto,
  IconUser,
  IconUserCircle,
} from '@tabler/icons-react';
import { DatePicker, Editor, Form, Input, Select, useToast } from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { AvatarUploadField } from '~/components/AvatarEditor';
import { toYmd } from '~/components/inlineCells';
import { isApiError, messageOf } from '~/lib/api';
import { SelectMember } from '~/modules/contacts/components/SelectMember';
import { linkNewContact } from '~/modules/contacts/components/useContactRelations';
import { useCustomerCreate } from '~/modules/contacts/customers/useCustomers';
import { PANEL_INPUT_CLASS_NAME, PanelFormLayout, PanelFormRow } from '../PanelForm';
import { useCreatedPanelRecord } from '../useCreatedPanelRecord';
import { useSidePanel, useSidePanelDraft } from '../useSidePanel';
import { ContactRelationInput } from './ContactRelationInput';

// Core stores the ISO/IEC 5218 codes; old erxes's pronoun codes are not kept.
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
    primaryEmail: z.union([z.literal(''), z.string().email('Invalid email format')]),
    primaryPhone: z.string(),
    ownerId: z.string(),
    code: z.string(),
    position: z.string(),
    sex: z.number().nullable(),
    birthDate: z.date().nullable(),
    description: z.string(),
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
    { message: 'Fill in a name, an e-mail or a phone', path: ['firstName'] },
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

const INPUT_CLASS_NAME = `${PANEL_INPUT_CLASS_NAME} border border-input`;

const orNull = (value: string) => value.trim() || null;

/**
 * A customer (or lead, `defaults.state`) not created yet, drawn like its
 * Detail tab: nothing saved until Save. The customer then replaces the
 * draft; Cancel leaves nothing behind.
 */
export const CustomerPanelNew = () => {
  const { t } = useTranslation('contact', { keyPrefix: 'customer' });
  const { t: addT } = useTranslation('contact', { keyPrefix: 'customer.add' });
  const { state, leadStageId } = useSidePanelDraft<{
    state: Customer['state'];
    leadStageId?: string;
  }>('core:customer');
  const { back, canGoBack, close } = useSidePanel();
  const { toast } = useToast();
  const [companyIds, setCompanyIds] = useState<string[]>([]);
  const [linking, setLinking] = useState(false);
  const showCreated = useCreatedPanelRecord('core:customer');
  const create = useCustomerCreate();
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
  const { errors } = form.formState;

  /** Returns to the previous record or closes a top-level unsaved draft. */
  const cancel = () => (canGoBack ? back() : close());

  const save = async (values: TCustomerForm) => {
    try {
      const created = await create.mutateAsync({
        state: state || 'customer',
        ...(state === 'lead' && leadStageId ? { leadStageId } : {}),
        firstName: orNull(values.firstName),
        middleName: orNull(values.middleName),
        lastName: orNull(values.lastName),
        primaryEmail: orNull(values.primaryEmail),
        primaryPhone: orNull(values.primaryPhone),
        ownerId: values.ownerId || null,
        code: orNull(values.code),
        position: orNull(values.position),
        sex: (values.sex ?? 0) as Customer['sex'],
        birthDate: values.birthDate ? toYmd(values.birthDate) : null,
        description: values.description || null,
        avatarUrl: values.avatarUrl || null,
      });

      // Creation succeeded: a link error still opens the customer, so Save
      // cannot create a duplicate.
      if (companyIds.length) {
        setLinking(true);
        await linkNewContact('core:customer', created.id, companyIds).catch((error: unknown) =>
          toast({
            variant: 'destructive',
            title: 'Could not link companies',
            description: messageOf(error),
          }),
        );
        setLinking(false);
      }

      showCreated(created.id);
    } catch (error) {
      if (isApiError(error, 'CUSTOMER_EXISTS')) {
        const details = error.data as { field?: 'primaryEmail' | 'primaryPhone' } | undefined;

        form.setError(details?.field ?? 'primaryEmail', { message: error.message });

        return;
      }

      toast({
        variant: 'destructive',
        title: t('error-title', 'Error'),
        description: messageOf(error),
      });
    }
  };

  /** A registered text input with its field label and validation error. */
  const textRow = (code: TTextCode, label: string) => (
    <PanelFormRow
      key={code}
      icon={TEXT_FIELD_ICONS[code]}
      label={label}
      error={errors[code]?.message}
    >
      <Input {...form.register(code)} placeholder={label} className={INPUT_CLASS_NAME} />
    </PanelFormRow>
  );

  return (
    <Form {...form}>
      <form
        className="mx-auto flex w-full max-w-2xl flex-1 min-h-0 flex-col"
        onSubmit={form.handleSubmit(save)}
      >
        <PanelFormLayout
          onCancel={cancel}
          saving={create.isPending || linking}
          saveLabel={
            state === 'lead'
              ? addT('create-lead', 'Create lead')
              : addT('create', 'Create customer')
          }
        >
          <PanelFormRow icon={IconPhoto} label={addT('picture', 'Picture')}>
            <Form.Field
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <AvatarUploadField value={field.value} onChange={field.onChange} />
              )}
            />
          </PanelFormRow>
          {textRow('firstName', addT('first-name', 'First name'))}
          {textRow('middleName', addT('middle-name', 'Middle name'))}
          {textRow('lastName', addT('last-name', 'Last name'))}
          <PanelFormRow icon={IconBuilding} label={t('company', 'Company')}>
            <ContactRelationInput
              kind="company"
              value={companyIds}
              onValueChange={setCompanyIds}
              scope="side-panel-customer-new.companies"
              disabled={create.isPending || linking}
            />
          </PanelFormRow>
          {textRow('primaryEmail', addT('email', 'Email'))}
          {textRow('primaryPhone', addT('phone', 'Phone'))}
          <PanelFormRow icon={IconUserCircle} label={t('owner', 'Owner')}>
            <Form.Field
              control={form.control}
              name="ownerId"
              render={({ field }) => (
                <SelectMember.FormItem
                  placeholder={t('owner', 'Owner')}
                  value={field.value}
                  onValueChange={(value) => field.onChange(value ?? '')}
                />
              )}
            />
          </PanelFormRow>
          {textRow('code', addT('code', 'Code'))}
          {textRow('position', t('position', 'Position'))}
          <PanelFormRow icon={IconGenderBigender} label={addT('pronoun', 'Pronoun')}>
            <Form.Field
              control={form.control}
              name="sex"
              render={({ field }) => (
                <Select
                  value={String(field.value ?? 0)}
                  onValueChange={(value) => field.onChange(Number(value))}
                >
                  <Select.Trigger className={INPUT_CLASS_NAME}>
                    <Select.Value placeholder={addT('pronoun', 'Pronoun')} />
                  </Select.Trigger>
                  <Select.Content align="start">
                    {CUSTOMER_SEX_OPTIONS.map((option) => (
                      <Select.Item key={option.value} value={option.value} className="h-7 text-xs">
                        {option.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              )}
            />
          </PanelFormRow>
          <PanelFormRow
            icon={IconCalendar}
            label={addT('birth-date', 'Birth date')}
            error={errors.birthDate?.message}
          >
            <Form.Field
              control={form.control}
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
          <div className="flex flex-col gap-1.5 pt-2">
            <span className="flex items-center gap-1.5 text-xs font-medium text-accent-foreground">
              <IconAlignLeft className="size-3.5" aria-hidden="true" />
              {addT('description', 'Description')}
            </span>
            <Form.Field
              control={form.control}
              name="description"
              render={({ field }) => (
                <Editor
                  initialContent={field.value}
                  onChange={field.onChange}
                  scope="side-panel-customer-new.description"
                />
              )}
            />
          </div>
        </PanelFormLayout>
      </form>
    </Form>
  );
};
