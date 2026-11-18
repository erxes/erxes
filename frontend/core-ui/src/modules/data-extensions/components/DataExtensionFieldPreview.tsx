import { IconArrowsRightLeft, IconEye } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataExtensionFieldType,
  DataExtensionValue,
  DataExtensionValueInput,
  IDataExtensionField,
  IDataExtensionFieldOption,
} from 'ui-modules';

const PreviewRow = ({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) => (
  <div className="grid min-h-7 grid-cols-[7rem_minmax(0,1fr)] items-center gap-x-3">
    <label
      htmlFor={htmlFor}
      className="truncate text-xs font-medium text-accent-foreground"
    >
      {label}
    </label>
    <div className="min-w-0">{children}</div>
  </div>
);

/**
 * How the field will look on a record while it is being set up: the same
 * editor the record screens use, filled in locally and never saved.
 */
export const DataExtensionFieldPreview = ({
  recordTypeLabel,
  label,
  type,
  options,
  relation,
}: {
  recordTypeLabel: string;
  label: string;
  type: DataExtensionFieldType;
  options: IDataExtensionFieldOption[];
  /** Set for relations: the other record type and its side's name. */
  relation?: { targetLabel: string; inverseLabel: string };
}) => {
  const { t } = useTranslation('dataExtensions');
  const [value, setValue] = useState<DataExtensionValue>(null);
  const shownLabel = label.trim() || t('builder.preview-untitled');

  useEffect(() => {
    setValue(null);
  }, [type]);

  const field: IDataExtensionField = {
    _id: 'preview',
    recordType: 'preview',
    key: 'preview',
    label: shownLabel,
    type,
    options: options
      .filter((option) => option.value.trim())
      .map((option) => ({
        value: option.value.trim(),
        label: option.label.trim() || option.value.trim(),
      })),
    order: 0,
    status: 'active',
  };

  return (
    <section
      aria-label={t('builder.preview-title')}
      className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4"
    >
      <header className="flex items-center gap-2 text-xs text-muted-foreground">
        <IconEye className="size-3.5" aria-hidden="true" />
        {t('builder.preview-title-on', { label: recordTypeLabel })}
      </header>
      <div className="flex flex-col gap-1.5 rounded-md border bg-background p-3 shadow-xs">
        {relation ? (
          <>
            <PreviewRow label={shownLabel}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled
                className="h-7 w-full justify-start text-xs font-normal text-muted-foreground"
              >
                {t('values.pick-records', { label: relation.targetLabel })}
              </Button>
            </PreviewRow>
            <p className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
              <IconArrowsRightLeft className="size-3.5" aria-hidden="true" />
              {t('builder.preview-inverse', {
                target: relation.targetLabel,
                label:
                  relation.inverseLabel.trim() || t('builder.preview-untitled'),
              })}
            </p>
          </>
        ) : (
          <PreviewRow label={shownLabel} htmlFor="data-extensions-preview">
            <DataExtensionValueInput
              id="data-extensions-preview"
              field={field}
              value={value}
              onChange={setValue}
              compact
            />
          </PreviewRow>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {t('builder.preview-hint')}
      </p>
    </section>
  );
};
