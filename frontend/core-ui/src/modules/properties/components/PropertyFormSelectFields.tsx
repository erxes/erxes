import { Button, Form, InfoCard, Input, toast, useConfirm } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { IPropertyForm } from '../types/Properties';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useFieldOptionUsedValues } from '../hooks/useFieldOptionUsedValues';

export const PropertyFormSelectFields = ({
  form,
  isEdit,
  fieldId,
}: {
  form: UseFormReturn<IPropertyForm>;
  isEdit?: boolean;
  fieldId?: string;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const { confirm } = useConfirm();
  const type = form.watch('type');
  const options = form.watch('options') || [];

  const savedOptionCount = isEdit
    ? (form.formState.defaultValues?.options?.length ?? 0)
    : 0;

  const { usedValues } = useFieldOptionUsedValues({
    fieldId: isEdit ? fieldId : undefined,
  });

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
            // `usedValues` is null when usage cannot be checked for this
            // field's content type (a plugin-owned type) — fall back to the
            // old, safe assumption that any pre-existing option is in use.
            const isUsed = isExisting
              ? (usedValues?.includes(option.value) ?? true)
              : false;
            return (
              <div className="flex gap-2" key={index}>
                <Form.Field
                  control={form.control}
                  name={`options.${index}.label`}
                  render={({ field }) => (
                    <Form.Item className="flex-auto">
                      {index === 0 && (
                        <Form.Label>{t('label', 'Label')}</Form.Label>
                      )}
                      <Form.Control>
                        <Input
                          {...field}
                          placeholder={t('enter-label', 'Enter label')}
                        />
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
                      {index === 0 && (
                        <Form.Label>{t('value', 'Value')}</Form.Label>
                      )}
                      <Form.Control>
                        <Input
                          {...field}
                          placeholder={t('enter-value', 'Enter value')}
                          disabled={isExisting}
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                <Button
                  onClick={() => {
                    if (isUsed) {
                      toast({
                        title: t(
                          'option-in-use',
                          'This option is used by existing records and cannot be removed',
                        ),
                        variant: 'destructive',
                      });
                      return;
                    }
                    confirm({
                      message: t(
                        'confirm-remove-option',
                        'Are you sure you want to remove this option?',
                      ),
                    }).then(() => {
                      setOptions(options.filter((_, i) => i !== index));
                    });
                  }}
                  variant="secondary"
                  size="icon"
                  className={
                    isUsed ? 'mt-auto size-8 opacity-50' : 'mt-auto size-8'
                  }
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
