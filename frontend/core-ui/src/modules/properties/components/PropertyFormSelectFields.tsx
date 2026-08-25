import { Button, Form, InfoCard, Input } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
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
  const options = form.watch('options') || [];

  const savedOptionCount = isEdit
    ? form.formState.defaultValues?.options?.length ?? 0
    : 0;

  const setOptions = (next: NonNullable<IPropertyForm['options']>) =>
    form.setValue('options', next, { shouldDirty: true });

  if (!['multiSelect', 'select', 'check', 'radio'].includes(type)) {
    return <></>;
  }

  return (
    <InfoCard title={t('select-options', 'Select options')}>
      <InfoCard.Content>
        <div className="flex flex-col gap-3">
          {options.map((_, index) => {
            const isExisting = index < savedOptionCount;
            return (
            <div className="flex gap-2" key={index}>
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
                onClick={() =>
                  setOptions(options.filter((_, i) => i !== index))
                }
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
            onClick={() => setOptions([...options, { label: '', value: '' }])}
            variant="secondary"
          >
            <IconPlus /> {t('add-option', 'Add option')}
          </Button>
        </div>
      </InfoCard.Content>
    </InfoCard>
  );
};
