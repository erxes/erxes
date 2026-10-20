import { DirectMailSenderSelect } from '@/integrations/mail/composer/components/fields/DirectMailSenderSelect';
import { useDirectMailComposerContext } from '@/integrations/mail/composer/hooks/useDirectMailComposerFields';
import { Alert, Button, Form, Label, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const FromRow = () => {
  const {
    form: { control },
    sendersLoading,
    sendersError,
    senders,
    handleRetry: onRetry,
  } = useDirectMailComposerContext();
  const { t } = useTranslation('frontline');
  return (
    <Form.Field
      control={control}
      name="integrationId"
      render={({ field, fieldState }) => (
        <Form.Item className="grid flex-none space-y-0 gap-y-1 grid-cols-[3.5rem_minmax(0,1fr)] items-center border-b px-4 py-1.5">
          <Label
            variant="peer"
            className="text-xs leading-5 text-muted-foreground"
            htmlFor="direct-mail-sender"
          >
            From
          </Label>
          <div className="flex min-h-9 min-w-0 items-center text-sm">
            {sendersLoading && (
              <span className="flex items-center gap-2 text-muted-foreground">
                <Spinner size="sm" containerClassName="h-4 w-4 flex-none" />
                {'Loading sender…'}
              </span>
            )}
            {!sendersLoading && senders.length > 0 && (
              <DirectMailSenderSelect
                value={field.value}
                onValueChange={field.onChange}
                onBlur={field.onBlur}
                invalid={fieldState.invalid}
                hasError={Boolean(fieldState.error)}
              />
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
