import { useDirectMailComposerContext } from '@/integrations/mail/composer/hooks/useDirectMailComposerFields';
import type { ComposeValues } from '@/integrations/mail/composer/types/directMailComposer';
import { Alert, Button, Form, Label, Select, Spinner } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export const FromRow = () => {
  const {
    sendersLoading,
    selectedSender,
    sendersError,
    senders,
    sending,
    failedDelivery,
    handleRetry: onRetry,
  } = useDirectMailComposerContext();
  const disabled = sending || Boolean(failedDelivery);
  const { t } = useTranslation('frontline');
  const { control } = useFormContext<ComposeValues>();
  return (
    <Form.Field
      control={control}
      name="integrationId"
      render={({ field, fieldState }) => (
        <Form.Item className="grid flex-none grid-cols-[3.5rem_minmax(0,1fr)] items-center border-b px-4 py-1.5">
          <Label
            variant="peer"
            className="text-xs text-muted-foreground"
            htmlFor="direct-mail-sender"
          >
            From
          </Label>
          <div className="flex min-h-9 min-w-0 items-center text-sm">
            {sendersLoading && (
              <span className="flex items-center gap-2 text-muted-foreground">
                <Spinner size="sm" />
                {'Loading sender…'}
              </span>
            )}
            {!sendersLoading && senders.length > 0 && (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={disabled}
              >
                <Select.Trigger
                  id="direct-mail-sender"
                  aria-label="From"
                  aria-invalid={fieldState.invalid}
                  aria-describedby={
                    fieldState.error ? 'direct-mail-sender-error' : undefined
                  }
                  onBlur={field.onBlur}
                  className="h-9 min-w-0 border-0 px-0 shadow-none focus:shadow-none"
                >
                  <Select.Value placeholder="Select sender">
                    {selectedSender &&
                      `${selectedSender.name} <${selectedSender.address}>`}
                  </Select.Value>
                </Select.Trigger>
                <Select.Content>
                  {senders.map((sender) => (
                    <Select.Item
                      key={sender.integrationId}
                      value={sender.integrationId}
                    >
                      {sender.name} &lt;{sender.address}&gt;
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            )}
          </div>
          <Form.Message
            id="direct-mail-sender-error"
            role="alert"
            className="col-start-2 text-xs"
          />
          {Boolean(sendersError) && (
            <Alert
              variant="destructive"
              className="col-start-2 border-0 bg-transparent p-0"
            >
              <Alert.Description>
                <p>{t('error-loading-data')}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onRetry}
                >
                  {t('try-again')}
                </Button>
              </Alert.Description>
            </Alert>
          )}
          {!sendersLoading && !sendersError && !senders.length && (
            <Alert
              variant="destructive"
              className="col-start-2 border-0 bg-transparent p-0"
            >
              <Alert.Description>
                {t('no-integration-found', { name: t('email') })}
              </Alert.Description>
            </Alert>
          )}
        </Form.Item>
      )}
    />
  );
};
