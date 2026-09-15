import { useApolloClient } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, Input, Sheet, Spinner, toast } from 'erxes-ui';
import { useForm, type Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SelectBrand } from 'ui-modules';
import { useState } from 'react';
import { useIntegrationAdd } from '@/integrations/hooks/useIntegrationAdd';
import { SecretInput } from '@/integrations/components/SecretInput';
import { VIBER_INTEGRATION_REFETCH } from '../graphql';
import {
  viberIntegrationSchema,
  type ViberIntegrationValues,
} from '../validation';
import { getSavedViberIntegrationId } from '../setupError';

export const ViberIntegrationFields = ({
  control,
  disabled,
}: {
  control: Control<ViberIntegrationValues>;
  disabled: boolean;
}) => {
  const { t } = useTranslation('frontline');
  return (
    <>
      <Form.Field
        control={control}
        name="name"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('name')}</Form.Label>
            <Form.Control>
              <Input
                {...field}
                disabled={disabled}
                autoComplete="off"
                maxLength={100}
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name="brandId"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('brand')}</Form.Label>
            <Form.Control>
              <SelectBrand
                value={field.value}
                onValueChange={field.onChange}
                disabled={disabled}
                className="w-full"
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
    </>
  );
};

export const ViberIntegrationForm = ({
  channelId,
  onClose,
  saving,
  onSavingChange,
}: {
  channelId: string;
  onClose: () => void;
  saving: boolean;
  onSavingChange: (saving: boolean) => void;
}) => {
  const { t } = useTranslation('frontline');
  const client = useApolloClient();
  const [failure, setFailure] = useState<string>();
  const { addIntegration } = useIntegrationAdd();
  const form = useForm<ViberIntegrationValues>({
    resolver: zodResolver(viberIntegrationSchema(false, t)),
    defaultValues: { name: '', brandId: '', token: '' },
  });
  const onSubmit = async (values: ViberIntegrationValues): Promise<void> => {
    if (saving) return;
    onSavingChange(true);
    setFailure(undefined);
    try {
      let createError: Error | undefined;
      const result = await addIntegration({
        variables: {
          name: values.name,
          brandId: values.brandId,
          channelId,
          kind: 'viber-messenger',
          data: { token: values.token },
        },
        onError: (error) => {
          createError = error;
        },
      });
      // The shared hook handles onError, so Apollo can resolve without data.
      if (!result.data?.integrationsCreateExternalIntegration?._id) {
        throw createError ?? new Error(t('failed-to-add-integration'));
      }
      form.resetField('token');
      onClose();
    } catch (error) {
      if (getSavedViberIntegrationId(error)) {
        // Do not leave a persisted connection in the "add" flow and create duplicates.
        form.resetField('token');
        toast({
          title: t('integration-added'),
          description: t('viber-setup-incomplete', {
            defaultValue:
              'Use Repair on the integration to finish connecting the bot.',
          }),
        });
        onClose();
      } else {
        setFailure(
          error instanceof Error
            ? error.message
            : t('failed-to-add-integration'),
        );
      }
    } finally {
      try {
        await client.refetchQueries({ include: VIBER_INTEGRATION_REFETCH });
      } catch {
        toast({
          title: t('integrations-refresh-failed', {
            defaultValue: 'Unable to refresh integrations. Please try again.',
          }),
          variant: 'destructive',
        });
      }
      onSavingChange(false);
    }
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col flex-auto overflow-hidden"
        aria-busy={saving}
      >
        <Sheet.Header>
          <Sheet.Title>
            {t('add-integration', { defaultValue: 'Add integration' })}
          </Sheet.Title>
          <Sheet.Description className="sr-only">Viber</Sheet.Description>
          <Sheet.Close disabled={saving} />
        </Sheet.Header>
        <Sheet.Content className="overflow-auto p-5 space-y-5">
          {failure && (
            <p role="alert" className="text-sm text-destructive">
              {failure}
            </p>
          )}
          <ViberIntegrationFields control={form.control} disabled={saving} />
          <Form.Field
            control={form.control}
            name="token"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>
                  {t('bot-token', { defaultValue: 'Bot token' })}
                </Form.Label>
                <Form.Control>
                  <SecretInput
                    {...field}
                    autoComplete="new-password"
                    spellCheck={false}
                    disabled={saving}
                  />
                </Form.Control>
                <Form.Description>
                  {t('viber-connect-token-help', {
                    defaultValue:
                      'Paste the token from your Viber bot settings. Connecting replaces the bot’s current webhook.',
                  })}
                </Form.Description>
                <Form.Message />
              </Form.Item>
            )}
          />
        </Sheet.Content>
        <Sheet.Footer>
          <Button
            type="button"
            variant="ghost"
            disabled={saving}
            onClick={onClose}
          >
            {t('close')}
          </Button>
          <Button type="submit" disabled={saving}>
            {saving && <Spinner size="sm" />}
            {t('connect', { defaultValue: 'Connect' })}
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
};
