import { ContactRelationInput } from '@/side-panel/components/details/ContactRelationInput';
import {
  IconAlignLeft,
  IconBriefcase,
  IconBuilding,
  IconBuildingFactory,
  IconHash,
  IconHierarchy,
  IconMail,
  IconMapPin,
  IconPhone,
  IconUser,
  IconUserCircle,
  IconUsers,
  IconWorld,
  type Icon,
} from '@tabler/icons-react';
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
import { useEffect, useState } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useCreatedContactPanelRecord } from '@/side-panel/hooks/useCreatedContactPanelRecord';
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
  .refine((data) => Boolean(data.primaryName?.trim() || data.code?.trim()), {
    message: 'Company name or code is required',
    path: ['primaryName'],
  });

type TCompanyForm = z.infer<typeof companySchema>;
type TCompanyTextField =
  'primaryName' | 'code' | 'primaryEmail' | 'primaryPhone' | 'website';

const TEXT_FIELD_ICONS: Record<TCompanyTextField, Icon> = {
  primaryName: IconBuilding,
  code: IconHash,
  primaryEmail: IconMail,
  primaryPhone: IconPhone,
  website: IconWorld,
};

const INPUT_CLASS_NAME = `${PANEL_INPUT_CLASS_NAME} border border-input`;

/** Edits the draft description using the surrounding company form context. */
const CompanyDescriptionInput = () => {
  const { control } = useFormContext<TCompanyForm>();
  const { t } = useTranslation('contact', { keyPrefix: 'company' });
  return (
    <div className="flex flex-col gap-1.5 pt-2">
      <span className="flex items-center gap-1.5 text-xs font-medium text-accent-foreground">
        <IconAlignLeft className="size-3.5" aria-hidden="true" />
        {t('description', 'Description')}
      </span>
      <Form.Field
        control={control}
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
  );
};

/**
 * A company not created yet, drawn like its Detail tab: nothing saved until
 * Save; the company then replaces the draft. A registry code fills in the
 * registered name. Cancel leaves nothing behind.
 */
export const CompanyPanelNew = () => {
  const { t } = useTranslation('contact', { keyPrefix: 'company' });
  const { back, canGoBack, close } = useSidePanel();
  const [customerIds, setCustomerIds] = useState<string[]>([]);
  const { onCreated, linking } = useCreatedContactPanelRecord(
    'core:company',
    customerIds,
  );
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

  /** Returns to the previous record or closes a top-level company draft. */
  const cancel = () => (canGoBack ? back() : close());

  /** Creates the company and replaces its draft panel after a successful mutation. */
  const save = ({
    industry,
    size,
    primaryName,
    primaryEmail,
    code,
    ...rest
  }: TCompanyForm) =>
    companiesAdd({
      variables: {
        ...rest,
        primaryName: primaryName?.trim() || undefined,
        email: primaryEmail,
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
        onCreated(created._id);
      },
    });

  /** Renders a registered text input with its field label and validation error. */
  const textRow = (name: TCompanyTextField, label: string) => (
    <PanelFormRow
      icon={TEXT_FIELD_ICONS[name]}
      label={label}
      error={errors[name]?.message}
    >
      <Input
        {...form.register(name)}
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
          saveLabel={t('add._', 'Add company')}
        >
          {textRow('primaryName', t('field.primaryName', 'Name'))}
          {textRow('code', t('code', 'Code'))}
          <PanelFormRow icon={IconUser} label={t('customer', 'Customer')}>
            <ContactRelationInput
              kind="customer"
              value={customerIds}
              onValueChange={setCustomerIds}
              scope="side-panel-company-new.customers"
              disabled={loading || linking}
            />
          </PanelFormRow>
          {textRow('primaryEmail', t('email', 'Email'))}
          {textRow('primaryPhone', t('phone', 'Phone'))}
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
          <PanelFormRow
            icon={IconHierarchy}
            label={t('parent-company', 'Parent company')}
          >
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
          <PanelFormRow
            icon={IconBuildingFactory}
            label={t('industries', 'Industries')}
          >
            <Form.Field
              control={form.control}
              name="industry"
              render={({ field }) => (
                <MultipleSelector
                  placeholder={t('industries', 'Industries')}
                  hidePlaceholderWhenSelected
                  defaultOptions={INDUSTRY_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  className="min-h-7 text-xs"
                />
              )}
            />
          </PanelFormRow>
          <PanelFormRow icon={IconMapPin} label={t('location', 'Location')}>
            <Form.Field
              control={form.control}
              name="location"
              render={({ field }) => (
                <Select
                  value={field.value || ''}
                  onValueChange={field.onChange}
                >
                  <Select.Trigger className={INPUT_CLASS_NAME}>
                    <Select.Value placeholder={t('location', 'Location')} />
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
          <PanelFormRow
            icon={IconBriefcase}
            label={t('business-type', 'Business type')}
          >
            <Form.Field
              control={form.control}
              name="businessType"
              render={({ field }) => (
                <Select
                  value={field.value || ''}
                  onValueChange={field.onChange}
                >
                  <Select.Trigger className={INPUT_CLASS_NAME}>
                    <Select.Value
                      placeholder={t('business-type', 'Business type')}
                    />
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
          <PanelFormRow icon={IconUsers} label={t('size', 'Size')}>
            <Input
              {...form.register('size')}
              type="number"
              placeholder={t('size', 'Size')}
              min={0}
              className={INPUT_CLASS_NAME}
            />
          </PanelFormRow>
          <CompanyDescriptionInput />
        </PanelFormLayout>
      </form>
    </Form>
  );
};
