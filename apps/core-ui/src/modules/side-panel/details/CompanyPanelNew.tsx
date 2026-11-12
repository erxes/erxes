import { zodResolver } from '@hookform/resolvers/zod';
import {
  type Icon,
  IconAlignLeft,
  IconBriefcase,
  IconBuilding,
  IconBuildingFactory,
  IconHash,
  IconMail,
  IconPhone,
  IconUser,
  IconUserCircle,
  IconUsers,
  IconWorld,
  IconPhoto,
} from '@tabler/icons-react';
import { Editor, Form, Input, MultipleSelector, Select, useToast } from 'erxes-ui';
import { useState } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { AvatarUploadField } from '~/components/AvatarEditor';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { isApiError, messageOf } from '~/lib/api';
import {
  COMPANY_BUSINESS_TYPES,
  DEFAULT_COMPANY_INDUSTRY_TYPES,
} from '~/modules/contacts/companies/companyConstants';
import { useCompanyCreate } from '~/modules/contacts/companies/useCompanies';
import { SelectMember } from '~/modules/contacts/components/SelectMember';
import { linkNewContact } from '~/modules/contacts/components/useContactRelations';
import { PANEL_INPUT_CLASS_NAME, PanelFormLayout, PanelFormRow } from '../PanelForm';
import { useCreatedPanelRecord } from '../useCreatedPanelRecord';
import { useSidePanel, useSidePanelDraft } from '../useSidePanel';
import { ContactRelationInput } from './ContactRelationInput';

const INDUSTRY_OPTIONS = DEFAULT_COMPANY_INDUSTRY_TYPES.filter(Boolean).map((industry) => ({
  label: industry,
  value: industry,
}));

const companySchema = z.object({
  // Core names every company.
  primaryName: z.string().trim().min(1, 'Company name is required'),
  code: z.string().optional(),
  ownerId: z.string().optional(),
  primaryEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  primaryPhone: z.string().optional(),
  website: z.string().optional(),
  industry: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  businessType: z.string().optional(),
  size: z.string().optional(),
  description: z.string().optional(),
  avatarUrl: z.string().nullable().optional(),
});

type TCompanyForm = z.infer<typeof companySchema>;

type TCompanyTextField = 'primaryName' | 'code' | 'primaryEmail' | 'primaryPhone' | 'website';

const TEXT_FIELD_ICONS: Record<TCompanyTextField, Icon> = {
  primaryName: IconBuilding,
  code: IconHash,
  primaryEmail: IconMail,
  primaryPhone: IconPhone,
  website: IconWorld,
};

const INPUT_CLASS_NAME = `${PANEL_INPUT_CLASS_NAME} border border-input`;

const orNull = (value?: string) => value?.trim() || null;

/** Edits the draft description using the surrounding company form context. */
const CompanyDescriptionInput = () => {
  const { control } = useFormContext<TCompanyForm>();
  const { t } = useTranslation('contact', { keyPrefix: 'company' });

  return (
    <div className="flex flex-col gap-1.5 pt-2">
      <span className="flex items-center gap-1.5 text-xs font-medium text-accent-foreground">
        <IconAlignLeft className="size-3.5" aria-hidden="true" />
        {t('field.description', 'Description')}
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
 * Save; the company then replaces the draft. Cancel leaves nothing behind.
 */
export const CompanyPanelNew = () => {
  const { t } = useTranslation('contact', { keyPrefix: 'company' });
  const { back, canGoBack, close } = useSidePanel();
  const { toast } = useToast();
  const [customerIds, setCustomerIds] = useState<string[]>([]);
  const [linking, setLinking] = useState(false);
  const showCreated = useCreatedPanelRecord('core:company');
  const create = useCompanyCreate();

  const { state, leadStageId } = useSidePanelDraft<{
    state?: 'lead' | 'customer';
    leadStageId?: string;
  }>('core:company');

  const form = useForm<TCompanyForm>({
    resolver: zodResolver(companySchema),
    defaultValues: { primaryName: '', code: '', industry: [] },
  });

  const { errors } = form.formState;

  /** Returns to the previous record or closes a top-level company draft. */
  const cancel = () => (canGoBack ? back() : close());

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
      });

      if (customerIds.length) {
        setLinking(true);
        await linkNewContact('core:company', created.id, customerIds).catch((error: unknown) =>
          toast({
            variant: 'destructive',
            title: 'Could not link customers',
            description: messageOf(error),
          }),
        );
        setLinking(false);
      }

      showCreated(created.id);
    } catch (error) {
      if (isApiError(error, 'COMPANY_EXISTS')) {
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

  /** A registered text input with its field label and validation error. */
  const textRow = (name: TCompanyTextField, label: string, required?: boolean) => (
    <PanelFormRow
      icon={TEXT_FIELD_ICONS[name]}
      label={label}
      required={required}
      error={errors[name]?.message}
    >
      <Input {...form.register(name)} placeholder={label} className={INPUT_CLASS_NAME} />
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
          saveLabel={t('add._', 'Add company')}
        >
          <PanelFormRow icon={IconPhoto} label={t('field.picture', 'Picture')}>
            <Form.Field
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <AvatarUploadField value={field.value ?? null} onChange={field.onChange} />
              )}
            />
          </PanelFormRow>
          {textRow('primaryName', t('field.primaryName', 'Name'), true)}
          {textRow('code', t('field.code', 'Code'))}
          <PanelFormRow icon={IconUser} label={t('customer', 'Customer')}>
            <ContactRelationInput
              kind="customer"
              value={customerIds}
              onValueChange={setCustomerIds}
              scope="side-panel-company-new.customers"
              disabled={create.isPending || linking}
            />
          </PanelFormRow>
          {textRow('primaryEmail', t('field.email', 'Email'))}
          {textRow('primaryPhone', t('field.phone', 'Phone'))}
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
          {textRow('website', t('field.website', 'Website'))}
          <PanelFormRow icon={IconBuildingFactory} label={t('field.industry', 'Industries')}>
            <Form.Field
              control={form.control}
              name="industry"
              render={({ field }) => (
                <MultipleSelector
                  placeholder={t('field.industry', 'Industries')}
                  hidePlaceholderWhenSelected
                  defaultOptions={INDUSTRY_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  className="min-h-7 text-xs"
                />
              )}
            />
          </PanelFormRow>
          <PanelFormRow icon={IconBriefcase} label={t('field.businessType', 'Business type')}>
            <Form.Field
              control={form.control}
              name="businessType"
              render={({ field }) => (
                <Select value={field.value || ''} onValueChange={field.onChange}>
                  <Select.Trigger className={INPUT_CLASS_NAME}>
                    <Select.Value placeholder={t('field.businessType', 'Business type')} />
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
          <PanelFormRow icon={IconUsers} label={t('field.size', 'Size')}>
            <Input
              {...form.register('size')}
              type="number"
              placeholder={t('field.size', 'Size')}
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
