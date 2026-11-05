import { ContactRelationInput } from '@/side-panel/components/details/ContactRelationInput';
import {
  IconAlignLeft,
  IconBell,
  IconBuilding,
  IconCalendar,
  IconGenderBigender,
  IconHash,
  IconMail,
  IconPhone,
  IconUser,
  IconUserCircle,
  type Icon,
} from '@tabler/icons-react';
import { useApolloClient } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  DatePicker,
  Editor,
  Form,
  Input,
  Select,
  Spinner,
  Switch,
  toast,
} from 'erxes-ui';
import { useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useCreatedContactPanelRecord } from '@/side-panel/hooks/useCreatedContactPanelRecord';
import {
  buildCustomerSchema,
  CUSTOMER_FORM_DEFAULTS,
  CUSTOMER_SEX_OPTIONS,
  ICustomerFormValues,
  PANEL_INPUT_CLASS_NAME,
  PanelFormLayout,
  PanelFormRow,
  SelectMember,
  useAddCustomer,
  useSidePanel,
  useSidePanelDraft,
  useSystemFieldRules,
} from 'ui-modules';

type TTextCode =
  | 'firstName'
  | 'middleName'
  | 'lastName'
  | 'primaryEmail'
  | 'primaryPhone'
  | 'code';

const TEXT_FIELD_ICONS: Record<TTextCode, Icon> = {
  firstName: IconUser,
  middleName: IconUser,
  lastName: IconUser,
  primaryEmail: IconMail,
  primaryPhone: IconPhone,
  code: IconHash,
};

const INPUT_CLASS_NAME = `${PANEL_INPUT_CLASS_NAME} border border-input`;

/**
 * A customer (or lead, `defaults.state`) not created yet, drawn like its
 * Detail tab: every field Settings shows, nothing saved until Save. The
 * customer then replaces the draft; Cancel leaves nothing behind.
 */
export const CustomerPanelNew = () => {
  const { t } = useTranslation('contact', { keyPrefix: 'customer' });
  const { t: addT } = useTranslation('contact', { keyPrefix: 'customer.add' });
  const { state } = useSidePanelDraft<{ state: 'customer' | 'lead' }>(
    'core:customer',
  );
  const { back, canGoBack, close } = useSidePanel();
  const [companyIds, setCompanyIds] = useState<string[]>([]);
  const { onCreated, linking } = useCreatedContactPanelRecord(
    'core:customer',
    companyIds,
  );
  const client = useApolloClient();
  const { customersAdd, loading } = useAddCustomer();
  const { rules, loading: rulesLoading } = useSystemFieldRules(
    'core:customer',
    'create',
  );

  // Rules arrive after the form mounts; validate against the latest ones.
  const schemaRef = useRef(buildCustomerSchema(rules));
  schemaRef.current = useMemo(() => buildCustomerSchema(rules), [rules]);

  const form = useForm<ICustomerFormValues>({
    resolver: (values, context, options) =>
      zodResolver(schemaRef.current)(values, context, options),
    defaultValues: CUSTOMER_FORM_DEFAULTS,
  });
  const { errors } = form.formState;

  /** Returns to the previous record or closes a top-level unsaved draft. */
  const cancel = () => (canGoBack ? back() : close());

  /** Creates the contact, invalidates its list, and replaces the draft after success. */
  const save = (values: ICustomerFormValues) =>
    customersAdd({
      variables: {
        firstName: values.firstName,
        middleName: values.middleName,
        lastName: values.lastName,
        code: values.code,
        ownerId: values.ownerId,
        primaryEmail: values.primaryEmail,
        primaryPhone: values.primaryPhone,
        sex: values.sex ?? 0,
        birthDate: values.birthDate ?? undefined,
        description: values.description,
        isSubscribed: values.isSubscribed,
        state: state || 'customer',
      },
      onError: (e) =>
        toast({
          title: 'Error',
          description: e.message,
          variant: 'destructive',
        }),
      onCompleted: ({ customersAdd: created }) => {
        // Customer lists read again, the new one included.
        client.cache.evict({ id: 'ROOT_QUERY', fieldName: 'customers' });
        onCreated(created._id);
      },
    });

  if (rulesLoading) {
    return <Spinner containerClassName="py-12" />;
  }

  /** Renders a registered text input with its field label and validation error. */
  const textRow = (code: TTextCode, label: string) =>
    rules.isShown(code) && (
      <PanelFormRow
        key={code}
        icon={TEXT_FIELD_ICONS[code]}
        label={label}
        required={rules.isRequired(code)}
        error={errors[code]?.message}
      >
        <Input
          {...form.register(code)}
          placeholder={label}
          className={INPUT_CLASS_NAME}
        />
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
          saving={loading || linking}
          saveLabel={
            state === 'lead'
              ? addT('create-lead', 'Create lead')
              : addT('create', 'Create customer')
          }
        >
          {textRow('firstName', addT('first-name', 'First name'))}
          {textRow('middleName', addT('middle-name', 'Middle name'))}
          {textRow('lastName', addT('last-name', 'Last name'))}
          <PanelFormRow icon={IconBuilding} label={t('company', 'Company')}>
            <ContactRelationInput
              kind="company"
              value={companyIds}
              onValueChange={setCompanyIds}
              scope="side-panel-customer-new.companies"
              disabled={loading || linking}
            />
          </PanelFormRow>
          {textRow('primaryEmail', t('email', 'Email'))}
          {textRow('primaryPhone', t('phone', 'Phone'))}
          {rules.isShown('ownerId') && (
            <PanelFormRow icon={IconUserCircle} label={t('owner', 'Owner')}>
              <Form.Field
                control={form.control}
                name="ownerId"
                render={({ field }) => (
                  <SelectMember.FormItem
                    placeholder={t('owner', 'Owner')}
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                )}
              />
            </PanelFormRow>
          )}
          {textRow('code', addT('code', 'Code'))}
          {rules.isShown('sex') && (
            <PanelFormRow
              icon={IconGenderBigender}
              label={addT('pronoun', 'Pronoun')}
            >
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
                        <Select.Item
                          key={option.value}
                          value={option.value}
                          className="h-7 text-xs"
                        >
                          {option.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                )}
              />
            </PanelFormRow>
          )}
          {rules.isShown('birthDate') && (
            <PanelFormRow
              icon={IconCalendar}
              label={addT('birth-date', 'Birth date')}
              required={rules.isRequired('birthDate')}
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
                    onChange={(date) =>
                      field.onChange(date instanceof Date ? date : null)
                    }
                  />
                )}
              />
            </PanelFormRow>
          )}
          {rules.isShown('isSubscribed') && (
            <PanelFormRow
              icon={IconBell}
              label={addT('subscribed', 'Subscribed')}
            >
              <Form.Field
                control={form.control}
                name="isSubscribed"
                render={({ field }) => (
                  <div className="flex h-7 items-center px-2">
                    <Switch
                      size="sm"
                      checked={field.value === 'Yes'}
                      onCheckedChange={(checked) =>
                        field.onChange(checked ? 'Yes' : 'No')
                      }
                    />
                  </div>
                )}
              />
            </PanelFormRow>
          )}
          {rules.isShown('description') && (
            <div className="flex flex-col gap-1.5 pt-2">
              <span className="flex items-center gap-1.5 text-xs font-medium text-accent-foreground">
                <IconAlignLeft className="size-3.5" aria-hidden="true" />
                {t('description', 'Description')}
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
          )}
        </PanelFormLayout>
      </form>
    </Form>
  );
};
