import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  IconArrowBackUp,
  IconEye,
  IconEyeOff,
  IconTrash,
} from '@tabler/icons-react';
import { Button, Form, Input, Select } from 'erxes-ui';
import { credentialValueAction, type CredentialFormValues } from '../form';
import { CONNECTION_PROVIDERS } from '../providers';
import type { CredentialField } from '../types';

export function ConnectionFields({
  optional = false,
  descriptors,
}: {
  optional?: boolean;
  descriptors: CredentialField[];
}) {
  const form = useFormContext<CredentialFormValues>();
  const fields = form.watch('fields');
  const templateId = form.watch('templateId');
  const [visible, setVisible] = useState<Record<string, boolean>>({});

  return (
    <div className="space-y-5">
      {fields.map((descriptor, index) => {
        if (optional === descriptor.required) return null;
        const label = descriptor.label || descriptor.key;
        const saved =
          descriptor.existing &&
          descriptor.hasValue &&
          descriptor.action === 'keep';
        const sensitive = descriptor.secret || descriptor.type === 'password';
        const help = descriptors.find(
          (field) => field.key === descriptor.key,
        )?.help;
        const change = (value: string) => {
          form.setValue(
            `fields.${index}.action`,
            credentialValueAction(descriptor, value),
          );
          form.setValue(`fields.${index}.value`, value, {
            shouldDirty: true,
            shouldValidate: form.formState.isSubmitted,
          });
        };
        return (
          <div key={descriptor.key} className="space-y-1">
            <Form.Field
              control={form.control}
              name={`fields.${index}.value`}
              render={({ field }) => (
                <Form.Item>
                  <div className="flex items-center justify-between gap-3">
                    <Form.Label variant="peer" className="text-sm font-medium">
                      {label}
                      {!descriptor.required && (
                        <span className="ml-1 font-normal text-muted-foreground">
                          (optional)
                        </span>
                      )}
                    </Form.Label>
                    {descriptor.existing &&
                      (descriptor.action !== 'keep' ||
                        (!descriptor.required && descriptor.hasValue)) && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 px-1 text-xs"
                          aria-label={
                            descriptor.action !== 'keep'
                              ? `Undo change to ${label}`
                              : `Clear ${label}`
                          }
                          onClick={() => {
                            form.setValue(`fields.${index}.value`, '');
                            form.setValue(
                              `fields.${index}.action`,
                              descriptor.action !== 'keep' ? 'keep' : 'clear',
                              { shouldDirty: true, shouldValidate: true },
                            );
                            setVisible((current) => ({
                              ...current,
                              [descriptor.key]: false,
                            }));
                          }}
                        >
                          {descriptor.action !== 'keep' ? (
                            <IconArrowBackUp />
                          ) : (
                            <IconTrash />
                          )}
                          {descriptor.action !== 'keep' ? 'Undo' : 'Clear'}
                        </Button>
                      )}
                  </div>
                  {descriptor.type === 'boolean' && !sensitive ? (
                    <Select value={field.value} onValueChange={change}>
                      <Form.Control>
                        <Select.Trigger aria-required={descriptor.required}>
                          <Select.Value
                            placeholder={
                              saved
                                ? 'Saved setting · unchanged'
                                : 'Choose an option'
                            }
                          />
                        </Select.Trigger>
                      </Form.Control>
                      <Select.Content>
                        <Select.Item value="true">Yes</Select.Item>
                        <Select.Item value="false">No</Select.Item>
                      </Select.Content>
                    </Select>
                  ) : (
                    <div className="relative">
                      <Form.Control>
                        <Input
                          {...field}
                          onChange={(event) => change(event.target.value)}
                          type={
                            sensitive && !visible[descriptor.key]
                              ? 'password'
                              : descriptor.type === 'number'
                              ? 'number'
                              : descriptor.type === 'url'
                              ? 'url'
                              : 'text'
                          }
                          placeholder={
                            saved
                              ? 'Saved securely · leave empty to keep'
                              : CONNECTION_PROVIDERS[templateId]
                                  ?.placeholders?.[descriptor.key] ||
                                `Enter ${label.toLowerCase()}`
                          }
                          aria-required={descriptor.required}
                          autoComplete="new-password"
                          spellCheck={false}
                          className={
                            sensitive
                              ? 'pr-10 placeholder:text-muted-foreground'
                              : 'placeholder:text-muted-foreground'
                          }
                        />
                      </Form.Control>
                      {sensitive && field.value && (
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="absolute right-0 top-0"
                          aria-label={`${
                            visible[descriptor.key] ? 'Hide' : 'Show'
                          } entered ${label}`}
                          aria-pressed={!!visible[descriptor.key]}
                          onClick={() =>
                            setVisible((current) => ({
                              ...current,
                              [descriptor.key]: !current[descriptor.key],
                            }))
                          }
                        >
                          {visible[descriptor.key] ? (
                            <IconEyeOff />
                          ) : (
                            <IconEye />
                          )}
                        </Button>
                      )}
                    </div>
                  )}
                  {descriptor.action === 'clear' && descriptor.hasValue && (
                    <p className="text-xs text-destructive">
                      This saved value will be removed.
                    </p>
                  )}
                  {help && (
                    <Form.Description className="leading-relaxed text-muted-foreground">
                      {help}
                    </Form.Description>
                  )}
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name={`fields.${index}.action`}
              render={() => (
                <Form.Item>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>
        );
      })}
    </div>
  );
}
