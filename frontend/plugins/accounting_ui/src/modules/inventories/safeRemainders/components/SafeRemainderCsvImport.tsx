import { IconArrowRight, IconDownload } from '@tabler/icons-react';
import { Badge, Button, Select } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ImportFieldFormat, TImportPreviewField } from 'ui-modules';
import { SafeRemainderImportSession } from '@/inventories/safeRemainders/hooks/useSafeRemainderImport';
import { SafeRemainderImportUpload } from '@/inventories/safeRemainders/components/SafeRemainderImportUpload';
import { SAFE_REMAINDER_CSV_FIELDS } from '@/inventories/safeRemainders/utils/parseSafeRemainderImport';

const IGNORE_COLUMN = '__ignore__';

const downloadTemplate = (): void => {
  const headers = SAFE_REMAINDER_CSV_FIELDS.map((field) => field.key).join(',');
  const content = `\uFEFF${headers}\r\n001,10,,false,\r\n`;
  const url = URL.createObjectURL(
    new Blob([content], { type: 'text/csv;charset=utf-8;' }),
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = 'safe-remainder-template.csv';
  link.click();
  URL.revokeObjectURL(url);
};

export const SafeRemainderCsvImport = ({
  session,
  disabled,
}: {
  session: SafeRemainderImportSession;
  disabled: boolean;
}) => {
  const { t } = useTranslation('accounting');
  const { preview, mapping, selectColumn, resetMapping } = session;
  const fields: TImportPreviewField[] = SAFE_REMAINDER_CSV_FIELDS.map(
    (field) => ({
      ...field,
      label: field.key,
      type: 'system',
      options:
        field.dataType === 'boolean'
          ? ['true', 'false', '1', '0', 'yes', 'no']
          : [],
    }),
  );
  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        className="w-full"
        onClick={downloadTemplate}
        disabled={disabled}
      >
        <IconDownload />
        {t('safe-import-download-template', {
          defaultValue: 'CSV загвар татах',
        })}
      </Button>
      <SafeRemainderImportUpload session={session} disabled={disabled} />
      {preview ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">
              {t('safe-import-match-columns', {
                defaultValue: 'Багануудыг тааруулах',
              })}{' '}
              ({preview.rows.length} {t('rows')})
            </p>
            <Button variant="ghost" disabled={disabled} onClick={resetMapping}>
              {t('safe-import-reset-mapping', {
                defaultValue: 'Анхны сонголт',
              })}
            </Button>
          </div>
          <div className="rounded-xl border px-3">
            {preview.headers.map((header, index) => (
              <div
                key={index}
                className="grid grid-cols-[1fr_auto_1fr] items-start gap-2 border-b py-3 last:border-0"
              >
                <div className="min-w-0 space-y-1">
                  <p className="truncate text-sm font-medium" title={header}>
                    {header}
                  </p>
                  <p
                    className="truncate text-xs text-muted-foreground"
                    title={preview.rows
                      .slice(0, 3)
                      .map((row) => row[index])
                      .join(' · ')}
                  >
                    {preview.rows
                      .slice(0, 3)
                      .map((row) => row[index])
                      .join(' · ')}
                  </p>
                </div>
                <IconArrowRight className="mt-2 size-4" />
                <div className="min-w-0 space-y-1">
                  <Select
                    value={mapping[index] || IGNORE_COLUMN}
                    disabled={disabled}
                    onValueChange={(value) =>
                      selectColumn(index, value === IGNORE_COLUMN ? '' : value)
                    }
                  >
                    <Select.Trigger className="w-full">
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item value={IGNORE_COLUMN}>
                        {t('safe-import-ignore-column', {
                          defaultValue: 'Импортлохгүй',
                        })}
                      </Select.Item>
                      {fields.map((field) => (
                        <Select.Item key={field.key} value={field.key}>
                          {field.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                  <ImportFieldFormat
                    field={fields.find((field) => field.key === mapping[index])}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            {t('safe-import-field-formats', {
              defaultValue: 'Талбарын формат',
            })}
          </p>
          {fields.map((field) => (
            <div
              key={field.key}
              className="flex items-start justify-between gap-2 rounded-lg border p-3"
            >
              <div>
                <p className="text-sm">{field.label}</p>
                <ImportFieldFormat field={field} />
              </div>
              {field.required && (
                <Badge variant="warning">
                  {t('safe-import-required', { defaultValue: 'Заавал' })}
                </Badge>
              )}
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            {t('safe-import-cost-help', {
              defaultValue:
                'totalCost нь тоолсон нийт өртөг. Хоосон бол систем тооцно. isSale=true үед unitPrice шаардлагатай.',
            })}
          </p>
        </div>
      )}
    </div>
  );
};
