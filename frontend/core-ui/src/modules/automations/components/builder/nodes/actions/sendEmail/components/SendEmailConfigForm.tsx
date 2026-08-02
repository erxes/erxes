import { useSendEmailSidebarForm } from '@/automations/components/builder/nodes/actions/sendEmail/hooks/useSendEmailSidebarForm';
import { TAutomationSendEmailConfig } from '@/automations/components/builder/nodes/actions/sendEmail/states/sendEmailConfigForm';
import { AutomationConfigFormWrapper } from '@/automations/components/builder/nodes/components/AutomationConfigFormWrapper';
import { SelectVerifiedSender } from '@/settings/mail-config/components/SelectVerifiedSender';
import { useSenderOptions } from '@/settings/mail-config/hooks/useVerifiedSenders';
import {
  Collapsible,
  Form,
  Input,
  Label,
  RadioGroup,
  Separator,
  Skeleton,
} from 'erxes-ui';
import { Control, FormProvider } from 'react-hook-form';
import {
  PlaceholderInput,
  TAutomationActionProps,
  TPlaceholderInputSuggestion,
  useFormValidationErrorHandler,
} from 'ui-modules';
import { SendEmailEmailContentBuilder } from './SendEmailEmailContentBuilder';
import { useTranslation } from 'react-i18next';

const ReplyToField = ({
  control,
  name,
  label,
  placeholder,
}: {
  control: Control<TAutomationSendEmailConfig>;
  name: 'fromEmailPlaceHolder' | 'replyToEmail';
  label: string;
  placeholder: string;
}) => (
  <Form.Field
    name={name}
    control={control}
    render={({ field }) => (
      <Form.Item>
        <Form.Label>{label}</Form.Label>
        <SelectVerifiedSender
          value={field.value}
          onChange={field.onChange}
          placeholder={placeholder}
        />
      </Form.Item>
    )}
  />
);

export const SendEmailConfigForm = ({
  currentActionIndex,
  currentAction,
  handleSave,
}: TAutomationActionProps<TAutomationSendEmailConfig>) => {
  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: 'Send email Configuration',
  });
  const { form, contentType, availableVariableSourceNodes } =
    useSendEmailSidebarForm(currentActionIndex, currentAction);
  const {
    supportsSenderVerification,
    defaultSenderEmail,
    alignedFrom,
    loading: senderOptionsLoading,
  } = useSenderOptions();
  const { t } = useTranslation('automations');
  const senderName = form.watch('sender');
  return (
    <FormProvider {...form}>
      <AutomationConfigFormWrapper
        onSave={form.handleSubmit(handleSave, handleValidationErrors)}
      >
        <Form.Field
          name="sender"
          control={form.control}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>
                {t('sender-name')}
                <span className="text-destructive">*</span>
              </Form.Label>
              <Form.Control>
                <Input {...field} placeholder="Sales team" />
              </Form.Control>
              {/*
                Without an authenticated domain the message can only be signed
                for the platform address, so the `From` is not a choice — it is
                the name typed here and nothing else.
              */}
              {alignedFrom && (
                <Form.Description>
                  {senderName
                    ? `${senderName} <${alignedFrom}>`
                    : `<${alignedFrom}>`}
                </Form.Description>
              )}
              <Form.Message />
            </Form.Item>
          )}
        />

        {senderOptionsLoading ? (
          <Skeleton className="h-5 w-40" />
        ) : alignedFrom ? null : (
          <>
            <Form.Field
              name="type"
              control={form.control}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>
                    {t('from')}
                    <span className="text-destructive">*</span>
                  </Form.Label>
                  <RadioGroup
                    value={field.value}
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <label className="flex space-x-2 items-center">
                      <RadioGroup.Item value="default" id="env-sender" />
                      <Label htmlFor="env-sender">
                        {t('use-company-email')}
                        {defaultSenderEmail && (
                          <span className="ml-1 text-muted-foreground font-normal">
                            ({defaultSenderEmail})
                          </span>
                        )}
                      </Label>
                    </label>
                    {supportsSenderVerification && (
                      <label className="flex space-x-2 items-center">
                        <RadioGroup.Item
                          value="verified"
                          id="verified-sender"
                        />
                        <Label htmlFor="verified-sender">
                          {t('verified-sender-email')}
                        </Label>
                      </label>
                    )}
                    <label className="flex space-x-2 items-center">
                      <RadioGroup.Item value="custom" id="custom-sender" />
                      <Label htmlFor="custom-sender">
                        {t('custom-sender-email')}
                      </Label>
                    </label>
                  </RadioGroup>
                </Form.Item>
              )}
            />
            <Form.Field
              name="type"
              control={form.control}
              render={({ field }) => {
                if (field.value === 'verified') {
                  return (
                    <Form.Field
                      name="fromEmailPlaceHolder"
                      control={form.control}
                      render={({ field: senderField }) => (
                        <Form.Item className="py-4">
                          <SelectVerifiedSender
                            value={senderField.value}
                            onChange={senderField.onChange}
                          />
                        </Form.Item>
                      )}
                    />
                  );
                }

                if (field.value === 'custom') {
                  return (
                    <Form.Field
                      name="fromEmailPlaceHolder"
                      control={form.control}
                      render={({ field }) => (
                        <Form.Item className="py-4">
                          <PlaceholderInput
                            propertyType={contentType || ''}
                            {...field}
                            disabled={[TPlaceholderInputSuggestion.Attribute]}
                            enabled={[
                              TPlaceholderInputSuggestion.Attribute,
                              TPlaceholderInputSuggestion.CallUser,
                            ]}
                            suggestionsOptions={{
                              call_user: {
                                selectFieldName: 'email',
                                formatSelection: (value) => value,
                              },
                            }}
                          />
                        </Form.Item>
                      )}
                    />
                  );
                }

                return <></>;
              }}
            />
          </>
        )}

        {/*
          Where the `From` is rewritten, the picked address is what replies come
          back to — so it is the same stored field, under the label for what it
          actually becomes. Two fields rather than one with a switched `name`:
          react-hook-form keeps a controller bound to the name it first
          registered, so a name that changes when the query resolves leaves the
          input reading a stale value.
        */}
        <ReplyToField
          control={form.control}
          name={alignedFrom ? 'fromEmailPlaceHolder' : 'replyToEmail'}
          key={alignedFrom ? 'aligned' : 'plain'}
          label={t('reply-to')}
          placeholder={t('no-reply-to')}
        />

        <Separator className="space-y-2" />

        <Collapsible>
          <Form.Field
            name="toEmailsPlaceHolders"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label className="flex justify-between">
                  <div>
                    {t('to')}
                    <span className="text-destructive">*</span>
                  </div>
                  <Collapsible.Trigger className="group">
                    <Form.Label className="group-data-[state=open]:text-destructive cursor-pointer pb-2">
                      {t('cc')}
                    </Form.Label>
                  </Collapsible.Trigger>
                </Form.Label>
                <PlaceholderInput
                  propertyType={contentType || ''}
                  {...field}
                  disabled={[TPlaceholderInputSuggestion.Attribute]}
                  enabled={[
                    TPlaceholderInputSuggestion.Attribute,
                    TPlaceholderInputSuggestion.CallUser,
                  ]}
                  suggestionsOptions={{
                    call_user: {
                      selectFieldName: 'email',
                      formatSelection: (value) => value,
                    },
                  }}
                />
              </Form.Item>
            )}
          />
          <Collapsible.Content className="pt-2">
            <Form.Field
              name="ccEmailsPlaceHolders"
              control={form.control}
              render={({ field }) => (
                <Form.Item>
                  <PlaceholderInput
                    propertyType={contentType || ''}
                    {...field}
                    disabled={[TPlaceholderInputSuggestion.Attribute]}
                    enabled={[
                      TPlaceholderInputSuggestion.Attribute,
                      TPlaceholderInputSuggestion.CallUser,
                    ]}
                    suggestionsOptions={{
                      call_user: {
                        selectFieldName: 'email',
                        formatSelection: (value) => value,
                      },
                    }}
                  />
                </Form.Item>
              )}
            />
          </Collapsible.Content>
        </Collapsible>
        <Separator className="space-y-2" />
        <Form.Field
          name="subject"
          control={form.control}
          render={({ field: { disabled: _disabled, ...field } }) => (
            <Form.Item>
              <Form.Label>
                {t('subject')}
                <span className="text-destructive">*</span>
              </Form.Label>
              <PlaceholderInput
                propertyType={contentType || ''}
                disabled={[TPlaceholderInputSuggestion.Attribute]}
                {...field}
              />
            </Form.Item>
          )}
        />
        <Separator className="space-y-2" />
        <Form.Field
          name="content"
          control={form.control}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>
                {t('email-content')}
                <span className="text-destructive">*</span>
              </Form.Label>
              <SendEmailEmailContentBuilder
                contentType={contentType || ''}
                content={field.value || ''}
                variableSourceNodes={availableVariableSourceNodes}
                onChange={field.onChange}
              />
            </Form.Item>
          )}
        />
      </AutomationConfigFormWrapper>
    </FormProvider>
  );
};
