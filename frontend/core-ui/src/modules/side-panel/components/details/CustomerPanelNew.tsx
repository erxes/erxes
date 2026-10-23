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
import { useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
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
  const { openRecord, back, canGoBack, close } = useSidePanel();
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

  const cancel = () => (canGoBack ? back() : close());

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
        openRecord(
          { contentType: 'core:customer', contentId: created._id },
          { replace: true },
        );
      },
    });

  if (rulesLoading) {
    return <Spinner containerClassName="py-12" />;
  }

  const textRow = (code: TTextCode, label: string, autoFocus = false) =>
    rules.isShown(code) && (
      <PanelFormRow
        key={code}
        label={label}
        required={rules.isRequired(code)}
        error={errors[code]?.message}
      >
        <Input
          {...form.register(code)}
          autoFocus={autoFocus}
          placeholder={label}
          className={PANEL_INPUT_CLASS_NAME}
        />
      </PanelFormRow>
    );

  return (
    <Form {...form}>
      <form
        className="flex flex-1 min-h-0 flex-col"
        onSubmit={form.handleSubmit(save)}
      >
        <PanelFormLayout
          onCancel={cancel}
          saving={loading}
          saveLabel={
            state === 'lead'
              ? addT('create-lead', 'Create lead')
              : addT('create', 'Create customer')
          }
        >
          {textRow('firstName', addT('first-name', 'First name'), true)}
          {textRow('middleName', addT('middle-name', 'Middle name'))}
          {textRow('lastName', addT('last-name', 'Last name'))}
          {textRow('primaryEmail', t('email', 'Email'))}
          {textRow('primaryPhone', t('phone', 'Phone'))}
          {rules.isShown('ownerId') && (
            <PanelFormRow label={t('owner', 'Owner')}>
              <Form.Field
                control={form.control}
                name="ownerId"
                render={({ field }) => (
                  <SelectMember.FormItem
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                )}
              />
            </PanelFormRow>
          )}
          {textRow('code', addT('code', 'Code'))}
          {rules.isShown('sex') && (
            <PanelFormRow label={addT('pronoun', 'Pronoun')}>
              <Form.Field
                control={form.control}
                name="sex"
                render={({ field }) => (
                  <Select
                    value={String(field.value ?? 0)}
                    onValueChange={(value) => field.onChange(Number(value))}
                  >
                    <Select.Trigger className={PANEL_INPUT_CLASS_NAME}>
                      <Select.Value />
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
              label={addT('birth-date', 'Birth date')}
              required={rules.isRequired('birthDate')}
              error={errors.birthDate?.message}
            >
              <Form.Field
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <DatePicker
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
            <PanelFormRow label={addT('subscribed', 'Subscribed')}>
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
              <span className="text-xs font-medium text-accent-foreground">
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
