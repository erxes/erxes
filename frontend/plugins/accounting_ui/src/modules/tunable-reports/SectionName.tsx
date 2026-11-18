import { useState } from 'react';
import { useWatch } from 'react-hook-form';
import { Button, Form, Input } from 'erxes-ui';
import { IconPencil } from '@tabler/icons-react';
import { ReportForm } from '@/tunable-reports/fields';
import { useReportTranslation } from '@/tunable-reports/locales';

export const SectionName = ({
  form,
  index,
}: {
  form: ReportForm;
  index: number;
}) => {
  const { t } = useReportTranslation();
  const [editing, setEditing] = useState(false);
  const path = `sections.${index}.name` as const;
  const value = useWatch({ control: form.control, name: path });
  return (
    <Form.Field
      control={form.control}
      name={path}
      render={({ field }) => (
        <Form.Item className="space-y-0">
          <Form.Label className="sr-only">{t('section')}</Form.Label>
          {editing ? (
            <Form.Control>
              <Input
                {...field}
                placeholder={t('section')}
                autoFocus={editing}
                className="h-9 font-normal"
                onFocus={() => setEditing(true)}
                onBlur={() => {
                  field.onBlur();
                  setEditing(false);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    event.currentTarget.blur();
                  }
                }}
              />
            </Form.Control>
          ) : (
            <div className="flex h-9 min-w-0 items-center gap-1">
              {value.trim() && (
                <h2 className="truncate font-semibold" title={value}>
                  {value}
                </h2>
              )}
              <Button
                type="button"
                variant="ghost"
                size={value.trim() ? 'icon' : 'sm'}
                aria-label={`${t('section')}: ${t('edit')}`}
                onClick={() => setEditing(true)}
              >
                <IconPencil className="size-4" />
                {!value.trim() && t('edit')}
              </Button>
            </div>
          )}
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};
