import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Badge, Button, Form, Input, Switch, Textarea } from 'erxes-ui';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  emptyCustomRow,
  TConnectionForm,
  TConnectionFormRow,
} from '@/settings/connections/form';

type RowProps = { index: number };

/**
 * A secret is write-only: a saved one shows "Saved" with a Replace action
 * and is never prefilled; replacing (or a new secret) is a masked input.
 */
const SecretValue = ({
  index,
  label,
}: RowProps & { label: string }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'connections' });
  const form = useFormContext<TConnectionForm>();
  const row = form.watch(`fields.${index}`);

  if (row.hasValue && !row.replace) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="success">{t('saved', 'Saved')}</Badge>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label={`${t('replace', 'Replace')} ${label}`}
          onClick={() =>
            form.setValue(`fields.${index}.replace`, true, { shouldDirty: true })
          }
        >
          {t('replace', 'Replace')}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Form.Field
        control={form.control}
        name={`fields.${index}.value`}
        render={({ field }) => (
          <Form.Control>
            <Input
              {...field}
              type="password"
              autoComplete="new-password"
              aria-label={label}
              placeholder={row.placeholder}
            />
          </Form.Control>
        )}
      />
      {row.hasValue ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            form.setValue(`fields.${index}.value`, '');
            form.setValue(`fields.${index}.replace`, false, {
              shouldDirty: true,
            });
          }}
        >
          {t('keep-saved', 'Keep saved')}
        </Button>
      ) : null}
    </div>
  );
};

const PlainValue = ({ index, label }: RowProps & { label: string }) => {
  const form = useFormContext<TConnectionForm>();
  const row = form.watch(`fields.${index}`);

  return (
    <Form.Field
      control={form.control}
      name={`fields.${index}.value`}
      render={({ field }) => (
        <Form.Control>
          {row.inputType === 'textarea' ? (
            <Textarea {...field} aria-label={label} placeholder={row.placeholder} />
          ) : (
            <Input
              {...field}
              type={row.inputType === 'email' ? 'email' : 'text'}
              inputMode={row.inputType === 'number' ? 'decimal' : undefined}
              aria-label={label}
              placeholder={row.placeholder}
            />
          )}
        </Form.Control>
      )}
    />
  );
};

/** A field the connection type defines: label and secrecy come from it. */
const SchemaRow = ({ index, row }: RowProps & { row: TConnectionFormRow }) => {
  const form = useFormContext<TConnectionForm>();
  const error = form.formState.errors.fields?.[index]?.value?.message;
  const label = row.label || row.key;

  return (
    <div className="flex flex-col gap-2">
      {/* The inputs carry this as their accessible name. */}
      <span className="text-sm font-medium">{label}</span>
      {row.secret ? (
        <SecretValue index={index} label={label} />
      ) : (
        <PlainValue index={index} label={label} />
      )}
      {row.description ? (
        <p className="text-xs text-muted-foreground">{row.description}</p>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
};

/** A user-defined key: editable key, value and secret toggle. */
const CustomRow = ({
  index,
  onRemove,
}: RowProps & { onRemove: () => void }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'connections' });
  const form = useFormContext<TConnectionForm>();
  const row = form.watch(`fields.${index}`);
  const errors = form.formState.errors.fields?.[index];
  const valueLabel = t('value', 'Value');
  // A saved secret stays sealed under its key: renaming would drop it.
  const keyLocked = row.hasValue;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-start gap-2">
        <Form.Field
          control={form.control}
          name={`fields.${index}.key`}
          render={({ field }) => (
            <Form.Control>
              <Input
                {...field}
                aria-label={t('key', 'Key')}
                placeholder={t('key', 'Key')}
                className="w-40"
                readOnly={keyLocked}
                title={
                  keyLocked
                    ? t(
                        'saved-secret-key-locked',
                        'Remove this row and add a new one to rename a saved secret',
                      )
                    : undefined
                }
              />
            </Form.Control>
          )}
        />
        <div className="grow">
          {row.secret ? (
            <SecretValue index={index} label={valueLabel} />
          ) : (
            <PlainValue index={index} label={valueLabel} />
          )}
        </div>
        <div className="flex h-8 items-center gap-1">
          <Switch
            checked={row.secret}
            aria-label={t('secret', 'Secret')}
            onCheckedChange={(checked) => {
              form.setValue(`fields.${index}.secret`, checked, {
                shouldDirty: true,
              });

              if (row.hasValue) {
                // A saved secret's value is unknown here: enter a new one.
                form.setValue(`fields.${index}.replace`, true);
              }
            }}
          />
          <span className="text-xs text-muted-foreground">
            {t('secret', 'Secret')}
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t('remove-field', 'Remove field')}
          onClick={onRemove}
        >
          <IconTrash />
        </Button>
      </div>
      {errors?.key?.message || errors?.value?.message ? (
        <p className="text-sm text-destructive">
          {errors?.key?.message || errors?.value?.message}
        </p>
      ) : null}
    </div>
  );
};

/** The connection's fields, rendered from its type's schema. */
export const ConnectionFieldsInput = ({
  allowCustomFields,
}: {
  allowCustomFields: boolean;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'connections' });
  const form = useFormContext<TConnectionForm>();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'fields',
  });

  return (
    <div className="flex flex-col gap-4">
      {fields.map((row, index) =>
        row.custom ? (
          <CustomRow key={row.id} index={index} onRemove={() => remove(index)} />
        ) : (
          <SchemaRow key={row.id} index={index} row={row} />
        ),
      )}
      {allowCustomFields ? (
        <Button
          type="button"
          variant="outline"
          className="self-start"
          onClick={() => append(emptyCustomRow())}
        >
          <IconPlus />
          {t('add-field', 'Add field')}
        </Button>
      ) : null}
    </div>
  );
};
