import { useState } from 'react';
import { useFormState, useWatch } from 'react-hook-form';
import { Button, Form, Input } from 'erxes-ui';
import { IconPencil } from '@tabler/icons-react';
import { ReportForm } from '@/tunable-reports/fields';
import { useReportTranslation } from '@/tunable-reports/locales';

export const ReportIdentityField = ({ form }: { form: ReportForm }) => {
  const { t } = useReportTranslation();
  const [editing, setEditing] = useState(false);
  const [code, name] = useWatch({
    control: form.control,
    name: ['code', 'name'],
  });
  const { errors } = useFormState({
    control: form.control,
    name: ['code', 'name'],
  });
  const showInputs =
    editing || !code.trim() || !name.trim() || !!errors.code || !!errors.name;
  return (
    <div
      className="min-w-0"
      onFocus={() => setEditing(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setEditing(false);
      }}
    >
      {showInputs ? (
        <div className="grid min-w-0 grid-cols-[minmax(5rem,10rem)_minmax(0,1fr)] gap-3">
          {(['code', 'name'] as const).map((key) => (
            <Form.Field
              key={key}
              control={form.control}
              name={key}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t(key)}</Form.Label>
                  <Form.Control>
                    <Input
                      {...field}
                      placeholder={t(key)}
                      className="font-normal"
                      autoFocus={editing && key === 'name'}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          event.currentTarget.blur();
                        }
                      }}
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
          ))}
        </div>
      ) : (
        <div className="flex min-w-0 items-center justify-center gap-1">
          <div className="flex min-w-0 items-center gap-3">
            <p
              className="truncate text-xs font-normal text-muted-foreground"
              title={code}
            >
              {code}
            </p>
            <h1 className="truncate text-xl font-bold" title={name}>
              {name}
            </h1>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`${t('name')}: ${t('edit')}`}
            onClick={() => setEditing(true)}
          >
            <IconPencil className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
