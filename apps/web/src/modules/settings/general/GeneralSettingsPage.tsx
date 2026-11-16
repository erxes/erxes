import { paths } from '~/lib/paths';
import { currencyOfCountry, type Organization } from '@erxes/core-contract';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconSettings } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Form, Input, PageContainer, PageHeader, ScrollArea, useToast } from 'erxes-ui';
import { useForm, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { CountrySelect, CurrencySelect } from '~/components/RegionSelect';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { useCan, useSession } from '~/modules/auth/session';

type Translate = (key: string, defaultValue: string) => string;

const organizationSchema = (t: Translate) =>
  z.object({
    name: z
      .string()
      .trim()
      .min(1, t('name-required', 'Enter a name'))
      .max(100, t('name-too-long', 'Use at most 100 characters')),
    country: z.string(),
    currency: z.string(),
  });

type OrganizationValues = z.infer<ReturnType<typeof organizationSchema>>;

const valuesOf = (organization: Organization): OrganizationValues => ({
  name: organization.name,
  country: organization.country ?? '',
  currency: organization.currency,
});

/** Saves the organisation and gives the whole app its new name, country and currency. */
const useSaveOrganization = (onSaved: (organization: Organization) => void) => {
  const { t } = useTranslation('settings', { keyPrefix: 'general' });
  const client = useQueryClient();
  const { toast } = useToast();

  return useMutation(
    orpc.organizations.update.mutationOptions({
      onSuccess: (organization) => {
        client.setQueryData(orpc.auth.me.queryKey(), (session) =>
          session ? { ...session, organization } : session,
        );
        void client.invalidateQueries({ queryKey: orpc.organizations.key() });
        onSaved(organization);
        toast({ title: t('saved', 'Organisation saved') });
      },
      onError: (error) =>
        toast({
          variant: 'destructive',
          title: t('save-failed', 'Could not save'),
          description: messageOf(error),
        }),
    }),
  );
};

/** Country and currency; a new country brings its currency, which stays editable. */
const RegionFields = ({ disabled }: { disabled: boolean }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'general' });
  const { control, getValues, setValue } = useFormContext<OrganizationValues>();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Form.Field
        control={control}
        name="country"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('country', 'Country')}</Form.Label>
            <Form.Control>
              <CountrySelect
                value={field.value}
                disabled={disabled}
                onChange={(next) => {
                  field.onChange(next);
                  setValue('currency', currencyOfCountry(next) ?? getValues('currency'), {
                    shouldDirty: true,
                  });
                }}
              />
            </Form.Control>
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name="currency"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('currency', 'Currency')}</Form.Label>
            <Form.Control>
              <CurrencySelect value={field.value} disabled={disabled} onChange={field.onChange} />
            </Form.Control>
            <Form.Description>
              {t(
                'currency-help',
                'New products and invoices take this currency. Products and invoices keep the currency they were made in.',
              )}
            </Form.Description>
          </Form.Item>
        )}
      />
    </div>
  );
};

/** The organisation's name and where it works; read-only without `settings.manage`. */
const OrganizationForm = ({
  organization,
  canEdit,
}: {
  organization: Organization;
  canEdit: boolean;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'general' });

  const form = useForm<OrganizationValues>({
    resolver: zodResolver(organizationSchema(t)),
    defaultValues: valuesOf(organization),
  });

  const save = useSaveOrganization((saved) => form.reset(valuesOf(saved)));

  const submit = form.handleSubmit((values) =>
    save.mutate({
      name: values.name,
      country: values.country || undefined,
      currency: values.currency,
    }),
  );

  return (
    <Form {...form}>
      <form className="flex flex-col gap-4" noValidate onSubmit={(event) => void submit(event)}>
        <Form.Section
          title={t('organization', 'Organisation')}
          description={t(
            'organization-description',
            'Its name, and the country and currency new records start from.',
          )}
        >
          <Form.Field
            control={form.control}
            name="name"
            render={({ field }) => (
              <Form.Item>
                <Form.Label required>{t('name', 'Organisation name')}</Form.Label>
                <Form.Control>
                  <Input {...field} maxLength={100} disabled={!canEdit} />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          <RegionFields disabled={!canEdit} />
        </Form.Section>
        {canEdit && <Form.SaveBar saving={save.isPending} />}
      </form>
    </Form>
  );
};

/** Settings › General: the organisation itself. */
export const GeneralSettingsPage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'general' });
  const { organization } = useSession();
  const canEdit = useCan()('settings.manage');

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[
              { label: t('title', 'General'), to: paths.settings.general, icon: IconSettings },
            ]}
          />
        </PageHeader.Start>
      </PageHeader>
      <ScrollArea className="flex-1">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-6">
          {!canEdit && (
            <p className="rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground">
              {t('read-only', 'Only owners and admins can change these settings.')}
            </p>
          )}
          <OrganizationForm organization={organization} canEdit={canEdit} />
        </div>
      </ScrollArea>
    </PageContainer>
  );
};
