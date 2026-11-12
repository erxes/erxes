import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Badge, Button, Form, InfoCard, Input } from 'erxes-ui';
import { useFieldArray, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { hasOptions } from '../fieldTypes';
import type { PropertyFormApi } from './propertyFormApi';

/** One option's label, how many records hold it, and its remove button. */
const OptionRow = ({
  form,
  index,
  held,
  onRemove,
}: {
  form: PropertyFormApi;
  index: number;
  held: number;
  onRemove: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });

  return (
    <div className="flex gap-2">
      <Form.Field
        control={form.control}
        name={`options.${index}.value`}
        render={({ field }) => (
          <Form.Item className="flex-auto">
            {index === 0 && <Form.Label>{t('label', 'Label')}</Form.Label>}
            <Form.Control>
              <Input {...field} placeholder={t('enter-label', 'Enter label')} disabled={held > 0} />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      {/* Kept even when empty so the columns line up across rows. */}
      <div className="mt-auto flex h-8 w-8 shrink-0 items-center justify-center">
        {held > 0 && (
          <Badge variant="secondary" title={t('option-held-by', 'Records holding this option')}>
            {held}
          </Badge>
        )}
      </div>
      <Button
        type="button"
        onClick={onRemove}
        variant="secondary"
        size="icon"
        className="mt-auto size-8"
        disabled={held > 0}
        aria-label={t('remove', 'Remove')}
        title={held > 0 ? t('option-held-by', 'Records holding this option') : undefined}
      >
        <IconTrash />
      </Button>
    </div>
  );
};

/** A select's options; an option records hold can't be renamed or removed. */
export const PropertyOptionsField = ({
  form,
  heldCount,
}: {
  form: PropertyFormApi;
  /** Records holding a saved option (0 for new ones). */
  heldCount: (value: string) => number;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const type = useWatch({ control: form.control, name: 'type' });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'options' });

  const savedValues = new Set(
    (form.formState.defaultValues?.options ?? []).map((option) => option?.value),
  );

  if (!hasOptions(type)) return null;

  return (
    <InfoCard title={t('select-options', 'Select options')}>
      <InfoCard.Content>
        <div className="flex flex-col gap-3">
          {fields.map((option, index) => {
            const saved = form.getValues(`options.${index}.value`);

            return (
              <OptionRow
                key={option.id}
                form={form}
                index={index}
                // Records hold this option: renaming or removing it would orphan their values.
                held={savedValues.has(saved) ? heldCount(saved) : 0}
                onRemove={() => remove(index)}
              />
            );
          })}
          <Button type="button" onClick={() => append({ value: '' })} variant="secondary">
            <IconPlus /> {t('add-option', 'Add option')}
          </Button>
          {form.formState.errors.options?.message && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.options.message}
            </p>
          )}
        </div>
      </InfoCard.Content>
    </InfoCard>
  );
};
