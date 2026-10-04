import { Badge, Button, cn, Form, InfoCard, Input } from 'erxes-ui';
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { IPropertyForm } from '../types/Properties';
import {
  IconArchive,
  IconAlertTriangle,
  IconArchiveOff,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import { OPTION_TYPES } from '../constants/fieldTypes';
import { PropertyUsageRecords } from './PropertyUsageRecords';
import {
  IArchivingOption,
  PropertyOptionArchiveDialog,
} from './PropertyOptionArchiveDialog';

export const PropertyFormSelectFields = ({
  form,
  isEdit,
  locked,
  fieldId,
  contentType,
  optionCount,
}: {
  form: UseFormReturn<IPropertyForm>;
  isEdit?: boolean;
  // A featured field's options belong to the plugin that owns it.
  locked?: boolean;
  fieldId?: string;
  contentType: string;
  // Records holding a saved option; null when they could not be checked.
  optionCount: (value: string) => number | null;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const type = form.watch('type');
  const options = form.watch('options') || [];
  const [archiving, setArchiving] = useState<
    (IArchivingOption & { index: number }) | null
  >(null);

  const setDeprecated = (index: number, deprecated: boolean) =>
    form.setValue(`options.${index}.deprecated`, deprecated, {
      shouldDirty: true,
    });

  const savedValues = new Set(
    isEdit
      ? (form.formState.defaultValues?.options ?? []).map(
          (saved) => saved?.value,
        )
      : [],
  );

  const setOptions = (next: NonNullable<IPropertyForm['options']>) =>
    form.setValue('options', next, {
      shouldDirty: true,
      shouldValidate: form.formState.isSubmitted,
    });

  if (!OPTION_TYPES.includes(type)) {
    return <></>;
  }

  return (
    <InfoCard title={t('select-options', 'Select options')}>
      <InfoCard.Content>
        <div className="flex flex-col gap-3">
          {options.map((option, index) => {
            const { deprecated } = option;
            // Matched by value, the option's identity, since rows can be removed.
            const savedValue = savedValues.has(option.value)
              ? option.value
              : undefined;
            const held = savedValue === undefined ? 0 : optionCount(savedValue);
            // A saved option no record holds is as free as a new one.
            const isExisting = held !== 0;
            return (
              <div className="flex flex-col gap-1" key={index}>
                <div className="flex gap-2">
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
                            disabled={locked}
                            className={cn(
                              deprecated && 'line-through opacity-60',
                            )}
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
                            disabled={isExisting || locked}
                          />
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                  {/* Kept even when empty so the columns line up across rows. */}
                  <div className="mt-auto flex h-8 w-8 shrink-0 items-center justify-center">
                    {!!held && fieldId && savedValue && (
                      <PropertyUsageRecords
                        fieldId={fieldId}
                        contentType={contentType}
                        value={savedValue}
                      >
                        <Badge
                          variant="secondary"
                          className="cursor-pointer"
                          title={t(
                            'option-held-by',
                            'Records holding this option',
                          )}
                        >
                          {held}
                        </Badge>
                      </PropertyUsageRecords>
                    )}
                  </div>
                  {/* Records hold this option, so it is archived, not removed. */}
                  {isExisting ? (
                    <Button
                      // Restoring is harmless; archiving asks first.
                      onClick={() =>
                        deprecated
                          ? setDeprecated(index, false)
                          : setArchiving({
                              index,
                              label: option.label,
                              value: option.value,
                              held,
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
                {deprecated && !!held && (
                  <p className="flex items-center gap-1 text-xs text-warning">
                    <IconAlertTriangle className="size-3.5 shrink-0" />
                    {t(
                      'option-archived-in-use',
                      'Archived, but {{count}} records still hold it. Review the settings that use it, then replace it or delete it once unused.',
                      { count: held },
                    )}
                  </p>
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
      <PropertyOptionArchiveDialog
        fieldId={fieldId}
        option={archiving}
        onConfirm={() => archiving && setDeprecated(archiving.index, true)}
        onClose={() => setArchiving(null)}
      />
    </InfoCard>
  );
};
