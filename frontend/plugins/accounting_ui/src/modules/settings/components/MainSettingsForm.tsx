import { useTranslation } from 'react-i18next';
import { Button, Checkbox, Collapsible, Form, Spinner } from 'erxes-ui';
import { useForm, UseFormReturn, useWatch } from 'react-hook-form';
import {
  mainSettingsSchema,
  TMainSettings,
} from '../constants/mainSettingsSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { SelectAccount } from '@/settings/account/components/SelectAccount';
import { useMainConfigs } from '../hooks/useMainConfigs';
import { useEffect } from 'react';
import { useMainUpdateConfigs } from '../hooks/useMainUpdateConfigs';
import deepEqual from 'deep-equal';
import { SelectMember } from 'ui-modules';

const DEFAULT_VALUES: TMainSettings = {
  MainCurrency: 'MNT',
  HasVat: false,
  HasCtax: false,
  dominantReadAccountUsers: [],
  dominantWriteAccountUsers: [],
};

export const MainSettingsForm = () => {
  const { t } = useTranslation('accounting');
  const { configs, loading } = useMainConfigs();
  const { updateConfigs, loading: saving } = useMainUpdateConfigs();
  const form = useForm<TMainSettings>({
    resolver: zodResolver(mainSettingsSchema),
    defaultValues: {
      MainCurrency: 'MNT',
      HasVat: false,
      HasCtax: false,
      dominantReadAccountUsers: [],
      dominantWriteAccountUsers: [],
    },
  });
  const { reset } = form;

  useEffect(() => {
    if (Object.keys(configs || {}).length > 0 && configs) {
      // Only reset if configs are different from current form values
      const currentValues = form.getValues();
      const hasChanges = !deepEqual(configs, currentValues);

      if (hasChanges) {
        reset({ ...DEFAULT_VALUES, ...configs });
      }
    }
  }, [configs, reset]);

  const onSubmit = (data: TMainSettings) => {
    updateConfigs({
      ...data,
    });
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="h-full w-full mx-auto max-w-2xl px-9 py-5 flex flex-col gap-8"
      >
        <h1 className="text-lg font-semibold">{t('general-settings-label')}</h1>
        <Collapsible defaultOpen>
          <Collapsible.TriggerButton className="h-8 w-auto text-base">
            <Collapsible.TriggerIcon />
            {t('access-priority-settings')}
          </Collapsible.TriggerButton>

          <Collapsible.Content className="pt-4 grid grid-cols-2 gap-4">
            <DominantAccountPermissionFields form={form} />
          </Collapsible.Content>
        </Collapsible>
        <Collapsible defaultOpen>
          <Collapsible.TriggerButton className="h-8 w-auto text-base">
            <Collapsible.TriggerIcon />
            {t('tax-settings')}
          </Collapsible.TriggerButton>
          <Collapsible.Content className="pt-4 grid grid-cols-2 gap-5">
            <VatFormFields form={form} />
            <CtaxFormFields form={form} />
          </Collapsible.Content>
        </Collapsible>
        <div className="text-right">
          <Button
            className="justify-self-end flex-none"
            type="submit"
            disabled={loading || saving}
          >
            {saving ? <Spinner /> : t('save')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export const DominantAccountPermissionFields = ({
  form,
}: {
  form: UseFormReturn<TMainSettings>;
}) => {
  const { t } = useTranslation('accounting');
  return (
    <>
      <Form.Field
        control={form.control}
        name="dominantReadAccountUsers"
        render={({ field }) => (
          <Form.Item className="col-span-2">
            <Form.Label>{t('users-with-access-to-all-accounts')}</Form.Label>
            <Form.Control>
              <SelectMember.FormItem
                mode="multiple"
                value={field.value || []}
                onValueChange={(users) =>
                  field.onChange(Array.isArray(users) ? users : [])
                }
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name="dominantWriteAccountUsers"
        render={({ field }) => (
          <Form.Item className="col-span-2">
            <Form.Label>
              {t('users-with-write-access-to-all-accounts')}
            </Form.Label>
            <Form.Control>
              <SelectMember.FormItem
                mode="multiple"
                value={field.value || []}
                onValueChange={(users) =>
                  field.onChange(Array.isArray(users) ? users : [])
                }
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
    </>
  );
};

export const VatFormFields = ({
  form,
}: {
  form: UseFormReturn<TMainSettings>;
}) => {
  const { t } = useTranslation('accounting');
  const { HasVat } = useWatch({ control: form.control });

  return (
    <>
      <Form.Field
        control={form.control}
        name="HasVat"
        render={({ field }) => (
          <Form.Item className="col-span-2 flex items-center gap-2 space-y-0">
            <Form.Control>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </Form.Control>
            <Form.Label variant="peer">{t('includes-vat')}</Form.Label>
          </Form.Item>
        )}
      />
      {HasVat && (
        <>
          <Form.Field
            control={form.control}
            name="VatPayableAccount"
            render={({ field }) => (
              <Form.Item>
                <Form.Label htmlFor="VatPayableAccount">
                  {t('vat-payable-account')}
                </Form.Label>
                <SelectAccount
                  value={field.value}
                  onValueChange={field.onChange}
                  defaultFilter={{ journals: ['tax'] }}
                />
              </Form.Item>
            )}
          />
          <Form.Field
            control={form.control}
            name="VatReceivableAccount"
            render={({ field }) => (
              <Form.Item>
                <Form.Label htmlFor="VatReceivableAccount">
                  {t('vat-receivable-account')}
                </Form.Label>
                <SelectAccount
                  value={field.value}
                  onValueChange={field.onChange}
                  defaultFilter={{ journals: ['tax'] }}
                />
              </Form.Item>
            )}
          />
          <Form.Field
            control={form.control}
            name="VatAfterPayableAccount"
            render={({ field }) => (
              <Form.Item>
                <Form.Label htmlFor="VatAfterPayableAccount">
                  {t('deferred-vat-payable-account')}
                </Form.Label>
                <SelectAccount
                  value={field.value}
                  onValueChange={field.onChange}
                  defaultFilter={{ journals: ['tax'] }}
                />
              </Form.Item>
            )}
          />
          <Form.Field
            control={form.control}
            name="VatAfterReceivableAccount"
            render={({ field }) => (
              <Form.Item>
                <Form.Label htmlFor="VatAfterReceivableAccount">
                  {t('deferred-vat-receivable-account')}
                </Form.Label>
                <SelectAccount
                  value={field.value}
                  onValueChange={field.onChange}
                  defaultFilter={{ journals: ['tax'] }}
                />
              </Form.Item>
            )}
          />
        </>
      )}
    </>
  );
};

export const CtaxFormFields = ({
  form,
}: {
  form: UseFormReturn<TMainSettings>;
}) => {
  const { t } = useTranslation('accounting');
  const { HasCtax } = useWatch({ control: form.control });
  return (
    <>
      <Form.Field
        control={form.control}
        name="HasCtax"
        render={({ field }) => (
          <Form.Item className="col-span-2 flex items-center gap-2 space-y-0 mt-7">
            <Form.Control>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </Form.Control>
            <Form.Label variant="peer">{t('includes-city-tax')}</Form.Label>
          </Form.Item>
        )}
      />
      {HasCtax && (
        <Form.Field
          control={form.control}
          name="CtaxPayableAccount"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('city-tax-payable-account')}</Form.Label>
              <SelectAccount
                value={field.value}
                onValueChange={field.onChange}
                defaultFilter={{ journals: ['tax'] }}
              />
            </Form.Item>
          )}
        />
      )}
    </>
  );
};
