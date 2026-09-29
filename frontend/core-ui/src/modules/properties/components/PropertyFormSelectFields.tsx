import { Button, Form, InfoCard, Input, useConfirm } from 'erxes-ui';
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useFields } from 'ui-modules';
import { IPropertyForm } from '../types/Properties';
import { IconPlus, IconTrash } from '@tabler/icons-react';

export const PropertyFormSelectFields = ({
  form,
  isEdit,
  contentType,
  fieldId,
}: {
  form: UseFormReturn<IPropertyForm>;
  isEdit?: boolean;
  contentType: string;
  fieldId?: string;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const { confirm } = useConfirm();
  const { fields: siblingFields } = useFields({ contentType, limit: 100 });
  const type = form.watch('type');
  const options = form.watch('options') || [];

  const getLogicDependentNames = (value: string) =>
    siblingFields
      .filter(
        (field) =>
          field._id !== fieldId &&
          Array.isArray(field.logics) &&
          field.logics.some(
            (rule) => rule.field === fieldId && rule.value === value,
          ),
      )
      .map((field) => field.name);

  // Saved options stay at the top of the list; new ones are appended below.
  const [savedOptionCount, setSavedOptionCount] = useState(
    isEdit ? form.formState.defaultValues?.options?.length ?? 0 : 0,
  );

  const setOptions = (next: NonNullable<IPropertyForm['options']>) =>
    form.setValue('options', next, {
      shouldDirty: true,
      shouldValidate: form.formState.isSubmitted,
    });

  if (!['multiSelect', 'select', 'check', 'radio'].includes(type)) {
    return <></>;
  }

  return (
    <InfoCard title={t('select-options', 'Select options')}>
      <InfoCard.Content>
        <div className="flex flex-col gap-3">
          {options.map((option, index) => {
            const isExisting = index < savedOptionCount;
            const removeOption = () =>
              setOptions(options.filter((_, i) => i !== index));
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
                onClick={() => {
                  if (!isExisting) {
                    removeOption();
                    return;
                  }
                  const logicDependentNames = getLogicDependentNames(
                    option.value,
                  );
                  const description = t(
                    'confirm-remove-option-description',
                    'If this option has been used, please note that its saved values may no longer be usable.',
                  );
                  confirm({
                    message: t(
                      'confirm-remove-option',
                      'Are you sure you want to remove this option?',
                    ),
                    options: {
                      description: logicDependentNames.length
                        ? `${description} ${t(
                            'confirm-remove-option-logic',
                            'The logic of these properties also depends on this option: {{names}}',
                            { names: logicDependentNames.join(', ') },
                          )}`
                        : description,
                    },
                  }).then(() => {
                    removeOption();
                    setSavedOptionCount((count) => count - 1);
                  });
                }}
                variant="secondary"
                size="icon"
                className="mt-auto size-8"
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
