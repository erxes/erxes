import { Button, Form, InfoCard, Input, Select } from 'erxes-ui';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { IPropertyForm } from '../types/Properties';
import { IconPlus, IconTrash } from '@tabler/icons-react';

const slugify = (label: string) => {
  const slug = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_');

  return slug.replace(/^_/, '').replace(/_$/, '');
};

export const PropertyFormObjectListFields = ({
  form,
  isEdit,
}: {
  form: UseFormReturn<IPropertyForm>;
  isEdit?: boolean;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const type = form.watch('type');

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'objectListConfigs',
  });

  const savedConfigCount = isEdit
    ? (form.formState.defaultValues?.objectListConfigs?.length ?? 0)
    : 0;

  if (type !== 'objectList') {
    return <></>;
  }

  return (
    <InfoCard title={t('object-list-fields', 'Object list fields')}>
      <InfoCard.Content>
        <div className="flex flex-col gap-3">
          {fields.map(({ id }, index) => {
            const isExisting = index < savedConfigCount;
            return (
              <div className="flex gap-2" key={id}>
                <Form.Field
                  control={form.control}
                  name={`objectListConfigs.${index}.label`}
                  render={({ field }) => (
                    <Form.Item className="flex-auto">
                      {index === 0 && (
                        <Form.Label>{t('label', 'Label')}</Form.Label>
                      )}
                      <Form.Control>
                        <Input
                          {...field}
                          placeholder={t('enter-label', 'Enter label')}
                          onChange={(e) => {
                            field.onChange(e);

                            if (!isExisting) {
                              const currentKey = form.getValues(
                                `objectListConfigs.${index}.key`,
                              );

                              if (!currentKey) {
                                form.setValue(
                                  `objectListConfigs.${index}.key`,
                                  slugify(e.target.value),
                                );
                              }
                            }
                          }}
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  control={form.control}
                  name={`objectListConfigs.${index}.key`}
                  render={({ field }) => (
                    <Form.Item className="flex-auto">
                      {index === 0 && (
                        <Form.Label>{t('key', 'Key')}</Form.Label>
                      )}
                      <Form.Control>
                        <Input
                          {...field}
                          placeholder={t('enter-key', 'Enter key')}
                          disabled={isExisting}
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  control={form.control}
                  name={`objectListConfigs.${index}.type`}
                  render={({ field }) => (
                    <Form.Item className="flex-none w-36">
                      {index === 0 && (
                        <Form.Label>{t('type', 'Type')}</Form.Label>
                      )}
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <Form.Control>
                          <Select.Trigger>
                            <Select.Value />
                          </Select.Trigger>
                        </Form.Control>
                        <Select.Content>
                          <Select.Item value="text">
                            {t('field-type.text', 'Text')}
                          </Select.Item>
                          <Select.Item value="textarea">
                            {t('field-type.textarea', 'Textarea')}
                          </Select.Item>
                        </Select.Content>
                      </Select>
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
            onClick={() => append({ key: '', label: '', type: 'text' })}
            variant="secondary"
          >
            <IconPlus /> {t('add-field', 'Add field')}
          </Button>
        </div>
      </InfoCard.Content>
    </InfoCard>
  );
};
