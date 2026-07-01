import { Button, Form, InfoCard, Input } from 'erxes-ui';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { IPropertyForm } from '../types/Properties';
import { IconPlus, IconTrash } from '@tabler/icons-react';

export const PropertyFormSelectFields = ({
  form,
  isEdit,
}: {
  form: UseFormReturn<IPropertyForm>;
  isEdit?: boolean;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const type = form.watch('type');
  const options = (form.formState.defaultValues?.options as unknown[])?.length ?? 0;

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'options' as never,
  });

  if (!['multiSelect', 'select', 'check', 'radio'].includes(type)) {
    return <></>;
  }

  return (
    <InfoCard title={t('select-options', 'Select options')}>
      <InfoCard.Content>
        <div className="flex flex-col gap-3">
          {fields.map((field, index) => {
            const isExisting = !!isEdit && index < options;
            return (
            <div className="flex gap-2" key={field.id}>
              <Form.Field
                control={form.control}
                name={`options.${index}.label`}
                render={({ field }) => (
                  <Form.Item className="flex-auto">
                    {index === 0 && <Form.Label>{t('label', 'Label')}</Form.Label>}
                    <Form.Control>
                      <Input {...field} placeholder={t('enter-label', 'Enter label')} />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name={`options.${index}.value`}
                render={({ field }) => (
                  <Form.Item className="flex-auto">
                    {index === 0 && <Form.Label>{t('value', 'Value')}</Form.Label>}
                    <Form.Control>
                      <Input {...field} placeholder={t('enter-value', 'Enter value')} disabled={isExisting} />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Button
                onClick={() => remove(index)}
                variant="secondary"
                size="icon"
                className="mt-auto size-8"
                disabled={isExisting}
              >
                <IconTrash />
              </Button>
            </div>
            );
          })}
          <Button
            onClick={() => append({ label: '', value: '' })}
            variant="secondary"
          >
            <IconPlus /> {t('add-option', 'Add option')}
          </Button>
        </div>
      </InfoCard.Content>
    </InfoCard>
  );
};
