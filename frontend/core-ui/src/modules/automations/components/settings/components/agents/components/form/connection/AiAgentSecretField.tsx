import { TAiAgentForm } from '@/automations/components/settings/components/agents/states/AiAgentFormSchema';
import { Button, Form, Input } from 'erxes-ui';
import { useState } from 'react';
import { FieldPath, useFormContext } from 'react-hook-form';

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
  const { control, setValue } = useFormContext<TAiAgentForm>();
  const [isReplacingSecret, setIsReplacingSecret] = useState(false);
  const hasStoredSecret = !!existingSecretMask?.trim();

  return (
    <Form.Field
      control={control}
      name={name}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{label}</Form.Label>
          {hasStoredSecret && !isReplacingSecret ? (
            <div className="space-y-3">
              <div className="flex h-10 items-center rounded-md border bg-muted/30 px-3">
                <span className="font-mono text-sm tracking-wide text-muted-foreground">
                  {existingSecretMask}
                </span>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsReplacingSecret(true)}
              >
                Replace secret
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
                  value={typeof field.value === 'string' ? field.value : ''}
                  onChange={field.onChange}
                />
              </Form.Control>
              {hasStoredSecret ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setValue(name, '' as any);
                    setIsReplacingSecret(false);
                  }}
                >
                  Keep existing secret
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
