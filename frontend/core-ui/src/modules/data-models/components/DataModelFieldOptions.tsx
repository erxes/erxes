import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Button, Form, Input } from 'erxes-ui';
import { useFieldArray, type UseFormReturn } from 'react-hook-form';
import type { ModelField } from '../types';
import type { DataModelFieldFormValues } from './DataModelFieldForm';

export const DataModelFieldOptions = ({
  form,
  field,
  loading,
}: {
  form: UseFormReturn<DataModelFieldFormValues>;
  field?: ModelField;
  loading: boolean;
}) => {
  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'options',
  });
  const error = form.formState.errors.options;
  return (
    <fieldset className="space-y-3" disabled={loading}>
      <legend className="mb-2 text-sm font-medium">Options</legend>
      <p className="text-xs text-muted-foreground">
        The choices people can select for this field.
      </p>
      {!fields.length && !field && (
        <div className="flex flex-wrap gap-2">
          {[
            {
              label: 'Use progress options',
              options: ['Not started', 'In progress', 'Done'],
            },
            {
              label: 'Use priority options',
              options: ['Low', 'Normal', 'High', 'Urgent'],
            },
          ].map((preset) => (
            <Button
              key={preset.label}
              type="button"
              variant="secondary"
              size="sm"
              onClick={() =>
                replace(preset.options.map((label) => ({ label, value: '' })))
              }
            >
              {preset.label}
            </Button>
          ))}
        </div>
      )}
      {fields.map((option, index) => {
        const saved = field?.options.some(
          (entry) => entry.value === option.value,
        );
        return (
          <div key={option.id} className="flex items-start gap-2">
            <Form.Field
              control={form.control}
              name={`options.${index}.label`}
              render={({ field: control }) => (
                <Form.Item className="min-w-0 flex-1">
                  <Form.Label className="sr-only">
                    Option {index + 1}
                  </Form.Label>
                  <Form.Control>
                    <Input {...control} placeholder={`Option ${index + 1}`} />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={loading || saved}
              aria-label={`Remove option ${index + 1}`}
              title={saved ? 'Saved options can be renamed.' : 'Remove option'}
              onClick={() => remove(index)}
            >
              <IconTrash className="size-4" />
            </Button>
          </div>
        );
      })}
      {(error?.root?.message || error?.message) && (
        <p role="alert" className="text-sm text-destructive">
          {error.root?.message || error.message}
        </p>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={loading || fields.length >= 100}
        onClick={() => append({ label: '', value: '' })}
      >
        <IconPlus className="size-4" />
        Add option
      </Button>
      {field?.options.length ? (
        <p className="text-xs text-muted-foreground">
          Saved options can be renamed. Removing them would affect existing
          records.
        </p>
      ) : null}
    </fieldset>
  );
};
