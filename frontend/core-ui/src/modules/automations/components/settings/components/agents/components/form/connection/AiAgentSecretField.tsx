import {
  secretInputValueOf,
  useAiAgentSecretField,
} from '@/automations/components/settings/components/agents/hooks/useAiAgentSecretField';
import { TAiAgentForm } from '@/automations/components/settings/components/agents/states/AiAgentFormSchema';
import { Button, Form, Input } from 'erxes-ui';
import { FieldPath } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export const AiAgentSecretField = ({
  name,
  label,
  placeholder,
  description,
  existingSecretMask,
}: {
  name: FieldPath<TAiAgentForm>;
  label: string;
  placeholder: string;
  description: string;
  existingSecretMask?: string;
}) => {
  const { t } = useTranslation('automations');
  const {
    control,
    showMask,
    canKeepStoredSecret,
    startReplacing,
    keepStoredSecret,
  } = useAiAgentSecretField(name, existingSecretMask);

  return (
    <Form.Field
      control={control}
      name={name}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{label}</Form.Label>
          {showMask ? (
            <div className="space-y-3">
              <div className="flex h-10 items-center rounded-md border bg-muted/30 px-3">
                <span className="font-mono text-sm tracking-wide text-muted-foreground">
                  {existingSecretMask}
                </span>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={startReplacing}
              >
                {t('settings-connection-replace-secret')}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Form.Control>
                <Input
                  type="password"
                  autoComplete="new-password"
                  placeholder={placeholder}
                  name={field.name}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  value={secretInputValueOf(field.value)}
                  onChange={field.onChange}
                />
              </Form.Control>
              {canKeepStoredSecret ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={keepStoredSecret}
                >
                  {t('settings-connection-keep-secret')}
                </Button>
              ) : null}
            </div>
          )}
          <Form.Description>{description}</Form.Description>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};
