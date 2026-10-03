import { Button, cn, Form, InfoCard, Input } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { IPropertyForm } from '../types/Properties';
import {
  IconArchive,
  IconArchiveOff,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';

export const PropertyFormSelectFields = ({
  form,
  isEdit,
  locked,
}: {
  form: UseFormReturn<IPropertyForm>;
  isEdit?: boolean;
  // A featured field's options belong to the plugin that owns it.
  locked?: boolean;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const type = form.watch('type');
  const options = form.watch('options') || [];

  const savedOptionCount = isEdit
    ? form.formState.defaultValues?.options?.length ?? 0
    : 0;

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
            const { deprecated } = option;
            return (
            <div className="flex gap-2" key={index}>
              <Form.Field
                control={form.control}
                name={`options.${index}.label`}
                render={({ field }) => (
                  <Form.Item className="flex-auto">
                    {index === 0 && <Form.Label>{t('label', 'Label')}</Form.Label>}
                    <Form.Control>
                      <Input
                        {...field}
                        placeholder={t('enter-label', 'Enter label')}
                        disabled={locked}
                        className={cn(deprecated && 'line-through opacity-60')}
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
                    {index === 0 && <Form.Label>{t('value', 'Value')}</Form.Label>}
                    <Form.Control>
                      <Input {...field} placeholder={t('enter-value', 'Enter value')} disabled={isExisting || locked} />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              {/* Records may hold a saved option, so it is archived, not removed. */}
              {isExisting ? (
                <Button
                  onClick={() =>
                    form.setValue(`options.${index}.deprecated`, !deprecated, {
                      shouldDirty: true,
                    })
                  }
                  variant="secondary"
                  size="icon"
                  className="mt-auto size-8"
                  disabled={locked}
                  title={
                    deprecated
                      ? t('restore-option', 'Restore option')
                      : t('archive-option', 'Archive option')
                  }
                >
                  {deprecated ? <IconArchiveOff /> : <IconArchive />}
                </Button>
              ) : (
                <Button
                  onClick={() =>
                    setOptions(options.filter((_, i) => i !== index))
                  }
                  variant="secondary"
                  size="icon"
                  className="mt-auto size-8"
                  disabled={locked}
                >
                  <IconTrash />
                </Button>
              )}
            </div>
            );
          })}
          {!locked && (
            <Button
              onClick={() => setOptions([...options, { label: '', value: '' }])}
              variant="secondary"
            >
              <IconPlus /> {t('add-option', 'Add option')}
            </Button>
          )}
        </div>
      </InfoCard.Content>
    </InfoCard>
  );
};
