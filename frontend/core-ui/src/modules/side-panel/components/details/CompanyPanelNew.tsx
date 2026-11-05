import { useApolloClient } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CountryPhoneCodes,
  Editor,
  Form,
  Input,
  MultipleSelector,
  Select,
  toast,
} from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import {
  COMPANY_BUSINESS_TYPES,
  DEFAULT_COMPANY_INDUSTRY_TYPES,
  PANEL_INPUT_CLASS_NAME,
  PanelFormLayout,
  PanelFormRow,
  SelectCompany,
  SelectMember,
  useAddCompany,
  useCompanyNameByRegister,
  useSidePanel,
} from 'ui-modules';
import { z } from 'zod';

const INDUSTRY_OPTIONS = DEFAULT_COMPANY_INDUSTRY_TYPES.filter(Boolean).map(
  (industry) => ({ label: industry, value: industry }),
);

const companySchema = z
  .object({
    primaryName: z.string().optional(),
    code: z.string().optional(),
    ownerId: z.string().optional(),
    parentCompanyId: z.string().optional(),
    primaryEmail: z
      .string()
      .email('Invalid email')
      .optional()
      .or(z.literal('')),
    primaryPhone: z.string().optional(),
    website: z.string().optional(),
    industry: z
      .array(z.object({ label: z.string(), value: z.string() }))
      .optional(),
    location: z.string().optional(),
    businessType: z.string().optional(),
    size: z.string().optional(),
    description: z.string().optional(),
  })
  .refine((data) => !!data.primaryName?.trim() || !!data.code?.trim(), {
    message: 'Company name or code is required',
    path: ['primaryName'],
  });

type TCompanyForm = z.infer<typeof companySchema>;

/**
 * A company not created yet, drawn like its Detail tab: nothing saved until
 * Save; the company then replaces the draft. A registry code fills in the
 * registered name. Cancel leaves nothing behind.
 */
export const CompanyPanelNew = () => {
  const { t } = useTranslation('contact', { keyPrefix: 'company' });
  const { openRecord, back, canGoBack, close } = useSidePanel();
  const client = useApolloClient();
  const { companiesAdd, loading } = useAddCompany();
  const form = useForm<TCompanyForm>({
    resolver: zodResolver(companySchema),
    defaultValues: { primaryName: '', code: '', industry: [] },
  });
  const { errors } = form.formState;

  const [code] = useDebounce(form.watch('code')?.trim() || '', 500);
  const { companyName: registeredName } = useCompanyNameByRegister(code);

  useEffect(() => {
    if (!registeredName) return;

    const currentName = form.getValues('primaryName')?.trim();

    if (currentName === registeredName) return;
    if (registeredName.includes('**') && currentName) return;

    form.setValue('primaryName', registeredName, { shouldValidate: true });
  }, [registeredName, form]);

  const cancel = () => (canGoBack ? back() : close());

  const save = ({ industry, size, primaryName, code, ...rest }: TCompanyForm) =>
    companiesAdd({
      variables: {
        ...rest,
        primaryName: primaryName?.trim() || undefined,
        code: code?.trim() || undefined,
        industry: industry?.map((option) => option.value),
        size: size ? Number(size) : undefined,
      },
      onError: (e) =>
        toast({
          title: 'Error',
          description: e.message,
          variant: 'destructive',
        }),
      onCompleted: ({ companiesAdd: created }) => {
        // Company lists read again, the new one included.
        client.cache.evict({ id: 'ROOT_QUERY', fieldName: 'companies' });
        openRecord(
          { contentType: 'core:company', contentId: created._id },
          { replace: true },
        );
      },
    });

  const textRow = (
    name: 'primaryName' | 'code' | 'primaryEmail' | 'primaryPhone' | 'website',
    label: string,
    autoFocus = false,
  ) => (
    <PanelFormRow label={label} error={errors[name]?.message}>
      <Input
        {...form.register(name)}
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
          saveLabel={t('add._', 'Add company')}
        >
          {textRow('primaryName', t('field.primaryName', 'Name'), true)}
          {textRow('code', t('code', 'Code'))}
          {textRow('primaryEmail', t('email', 'Email'))}
          {textRow('primaryPhone', t('phone', 'Phone'))}
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
          <PanelFormRow label={t('parent-company', 'Parent company')}>
            <Form.Field
              control={form.control}
              name="parentCompanyId"
              render={({ field }) => (
                <SelectCompany
                  mode="single"
                  value={field.value}
                  onValueChange={field.onChange}
                />
              )}
            />
          </PanelFormRow>
          {textRow('website', t('website', 'Website'))}
          <PanelFormRow label={t('industries', 'Industries')}>
            <Form.Field
              control={form.control}
              name="industry"
              render={({ field }) => (
                <MultipleSelector
                  defaultOptions={INDUSTRY_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  className="min-h-7 text-xs"
                />
              )}
            />
          </PanelFormRow>
          <PanelFormRow label={t('location', 'Location')}>
            <Form.Field
              control={form.control}
              name="location"
              render={({ field }) => (
                <Select
                  value={field.value || ''}
                  onValueChange={field.onChange}
                >
                  <Select.Trigger className={PANEL_INPUT_CLASS_NAME}>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    {CountryPhoneCodes.map((country) => (
                      <Select.Item
                        key={country.code}
                        value={country.name}
                        className="text-xs"
                      >
                        <span className="mr-2">{country.flag}</span>
                        {country.name}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              )}
            />
          </PanelFormRow>
          <PanelFormRow label={t('business-type', 'Business type')}>
            <Form.Field
              control={form.control}
              name="businessType"
              render={({ field }) => (
                <Select
                  value={field.value || ''}
                  onValueChange={field.onChange}
                >
                  <Select.Trigger className={PANEL_INPUT_CLASS_NAME}>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    {COMPANY_BUSINESS_TYPES.filter(Boolean).map((type) => (
                      <Select.Item key={type} value={type} className="text-xs">
                        {type}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              )}
            />
          </PanelFormRow>
          <PanelFormRow label={t('size', 'Size')}>
            <Input
              {...form.register('size')}
              type="number"
              min={0}
              className={PANEL_INPUT_CLASS_NAME}
            />
          </PanelFormRow>
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
                  scope="side-panel-company-new.description"
                />
              )}
            />
          </div>
        </PanelFormLayout>
      </form>
    </Form>
  );
};
