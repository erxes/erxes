import { useFieldArray, useFormContext } from 'react-hook-form';
import { Button, Checkbox, Collapsible, Form, Input, Select } from 'erxes-ui';
import {
  IconAdjustmentsHorizontal,
  IconPlus,
  IconTrash,
  IconArrowBackUp,
} from '@tabler/icons-react';
import {
  CredentialFormValues,
  credentialValueAction,
  newCustomField,
} from '../form';
import { CredentialField } from '../types';

export function CredentialFields({
  generic,
  descriptors,
}: {
  generic: boolean;
  descriptors: CredentialField[];
}) {
  const form = useFormContext<CredentialFormValues>();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'fields',
  });
  const values = form.watch('fields');
  const fieldsError =
    form.formState.errors.fields?.root?.message ||
    form.formState.errors.fields?.message;

  return (
    <section className="space-y-3" aria-label="Credential fields">
      <div className="space-y-1">
        <h3 className="text-sm font-medium">Key-value pairs</h3>
        <p className="text-xs text-muted-foreground">
          {fields.some((field) => field.existing)
            ? 'Saved values stay unchanged unless you replace or clear them.'
            : 'Enter your values. All values are encrypted when saved.'}
        </p>
      </div>
      {fields.map((row, index) => {
        const value = values[index];
        const descriptor = descriptors.find(({ key }) => key === row.key);
        const label = value?.label || value?.key || `Field ${index + 1}`;
        const custom = generic && !row.existing;
        const changeValue = (next: string) => {
          form.setValue(
            `fields.${index}.action`,
            credentialValueAction(row, next),
          );
          form.setValue(`fields.${index}.value`, next, { shouldDirty: true });
        };
        return (
          <Collapsible className="space-y-2" key={row.id}>
            <div className="flex items-start gap-1">
              <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_12px_minmax(0,1.5fr)] items-start gap-2">
                <Form.Field
                  control={form.control}
                  name={`fields.${index}.key`}
                  render={({ field }) => (
                    <Form.Item className="min-w-0">
                      <Form.Label className="sr-only">{label} key</Form.Label>
                      <Form.Control>
                        <Input
                          {...field}
                          readOnly={!custom}
                          placeholder="KEY"
                          title={label}
                          className="font-mono text-xs"
                          autoComplete="off"
                          spellCheck={false}
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                <span
                  aria-hidden="true"
                  className="flex h-8 items-center justify-center text-muted-foreground"
                >
                  =
                </span>
                <Form.Field
                  control={form.control}
                  name={`fields.${index}.value`}
                  render={({ field }) => (
                    <Form.Item className="min-w-0">
                      <Form.Label className="sr-only">
                        {label} value{row.required ? ' (required)' : ''}
                      </Form.Label>
                      {value.type === 'boolean' && !value.secret ? (
                        <Select value={field.value} onValueChange={changeValue}>
                          <Form.Control>
                            <Select.Trigger aria-required={row.required}>
                              <Select.Value
                                placeholder={
                                  row.existing &&
                                  value.action === 'keep' &&
                                  row.hasValue
                                    ? 'Saved · unchanged'
                                    : value.action === 'clear' && row.existing
                                    ? 'Will be cleared'
                                    : row.required
                                    ? 'Choose true or false'
                                    : 'Optional'
                                }
                              />
                            </Select.Trigger>
                          </Form.Control>
                          <Select.Content>
                            <Select.Item value="true">True</Select.Item>
                            <Select.Item value="false">False</Select.Item>
                          </Select.Content>
                        </Select>
                      ) : (
                        <Form.Control>
                          <Input
                            {...field}
                            onChange={(event) =>
                              changeValue(event.target.value)
                            }
                            type={
                              value.secret || value.type === 'password'
                                ? 'password'
                                : value.type === 'number'
                                ? 'number'
                                : value.type === 'url'
                                ? 'url'
                                : 'text'
                            }
                            placeholder={
                              row.existing &&
                              value.action === 'keep' &&
                              row.hasValue
                                ? 'Saved · type to replace'
                                : value.action === 'clear' && row.existing
                                ? 'Will be cleared'
                                : row.required
                                ? 'Required value'
                                : 'Optional value'
                            }
                            aria-required={row.required}
                            step={value.type === 'number' ? 'any' : undefined}
                            autoComplete="new-password"
                            spellCheck={false}
                          />
                        </Form.Control>
                      )}
                      {descriptor?.help && (
                        <Form.Description>{descriptor.help}</Form.Description>
                      )}
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              </div>
              {custom && (
                <>
                  <Collapsible.Trigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Options for field ${index + 1}`}
                    >
                      <IconAdjustmentsHorizontal />
                    </Button>
                  </Collapsible.Trigger>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove field ${index + 1}`}
                    onClick={() => remove(index)}
                  >
                    <IconTrash />
                  </Button>
                </>
              )}
              {row.existing && (
                <div className="w-8 shrink-0">
                  {(value.action !== 'keep' || !row.required) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={
                        value.action !== 'keep'
                          ? `Undo change to ${label}`
                          : `Clear ${label}`
                      }
                      onClick={() => {
                        form.setValue(`fields.${index}.value`, '');
                        form.setValue(
                          `fields.${index}.action`,
                          value.action !== 'keep' ? 'keep' : 'clear',
                          { shouldDirty: true },
                        );
                      }}
                    >
                      {value.action !== 'keep' ? (
                        <IconArrowBackUp />
                      ) : (
                        <IconTrash />
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>
            <Form.Field
              control={form.control}
              name={`fields.${index}.action`}
              render={() => (
                <Form.Item>
                  <Form.Message />
                </Form.Item>
              )}
            />
            {custom && (
              <Collapsible.Content className="grid grid-cols-1 gap-3 rounded-md bg-muted/40 p-3 sm:grid-cols-2">
                <Form.Field
                  control={form.control}
                  name={`fields.${index}.label`}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Label (optional)</Form.Label>
                      <Form.Control>
                        <Input {...field} autoComplete="off" />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  control={form.control}
                  name={`fields.${index}.type`}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Type</Form.Label>
                      <Select
                        value={field.value}
                        onValueChange={(next) => {
                          field.onChange(next);
                          changeValue('');
                        }}
                      >
                        <Form.Control>
                          <Select.Trigger>
                            <Select.Value />
                          </Select.Trigger>
                        </Form.Control>
                        <Select.Content>
                          {['text', 'password', 'number', 'url', 'boolean'].map(
                            (type) => (
                              <Select.Item key={type} value={type}>
                                {type}
                              </Select.Item>
                            ),
                          )}
                        </Select.Content>
                      </Select>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  control={form.control}
                  name={`fields.${index}.secret`}
                  render={({ field }) => (
                    <Form.Item className="flex items-center gap-2 sm:col-span-2">
                      <Form.Control>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) =>
                            field.onChange(checked === true)
                          }
                        />
                      </Form.Control>
                      <Form.Label className="!mt-0">Sensitive value</Form.Label>
                    </Form.Item>
                  )}
                />
              </Collapsible.Content>
            )}
          </Collapsible>
        );
      })}
      {fieldsError && (
        <p role="alert" className="text-sm text-destructive">
          {fieldsError}
        </p>
      )}
      {generic && (
        <Button
          type="button"
          variant="ghost"
          onClick={() => append(newCustomField())}
          disabled={fields.length >= 32}
        >
          <IconPlus />
          Add key-value pair
        </Button>
      )}
    </section>
  );
}
