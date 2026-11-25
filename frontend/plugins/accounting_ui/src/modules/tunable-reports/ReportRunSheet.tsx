import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, DatePicker, Form, Input, Sheet } from 'erxes-ui';
import { IconReport } from '@tabler/icons-react';
import { format, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { SelectBranches, SelectDepartments } from 'ui-modules';
import { Choice } from '@/tunable-reports/fields';
import { useReportTranslation } from '@/tunable-reports/locales';
import {
  defaultReportRunSettings,
  getReportRunSchema,
  reportRunPath,
  ReportRunSettings,
} from '@/tunable-reports/runReport';

const locationFields = [
  { name: 'branchId', label: 'branch', Select: SelectBranches.FormItem },
  {
    name: 'departmentId',
    label: 'department',
    Select: SelectDepartments.FormItem,
  },
] as const;

export const ReportRunSheet = ({
  report,
  open,
  onOpenChange,
  defaultValues,
  onRun,
}: {
  report: { _id: string; name: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: ReportRunSettings;
  onRun?: (settings: ReportRunSettings) => void;
}) => {
  const { t: tReport } = useReportTranslation();
  const { t } = useTranslation('accounting');
  const form = useForm<ReportRunSettings>({
    resolver: zodResolver(getReportRunSchema(tReport)),
    defaultValues: defaultValues ?? defaultReportRunSettings(),
  });
  const submit = form.handleSubmit((settings) => {
    if (onRun) {
      onRun(settings);
    } else {
      window.open(
        reportRunPath(report._id, settings),
        '_blank',
        'noopener,noreferrer',
      );
    }
    onOpenChange(false);
  });
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <Sheet.View className="sm:max-w-lg bg-background">
        <Sheet.Header className="h-auto py-2">
          <div className="min-w-0">
            <Sheet.Title>{tReport('run')}</Sheet.Title>
            <Sheet.Description className="truncate">
              {report.name}
            </Sheet.Description>
          </div>
          <Sheet.Close />
        </Sheet.Header>
        <Form {...form}>
          <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
            <Sheet.Content className="space-y-4 overflow-y-auto p-4">
              {(['fromDate', 'toDate'] as const).map((name) => (
                <Form.Field
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>{tReport(name)}</Form.Label>
                      <DatePicker
                        value={field.value ? parseISO(field.value) : undefined}
                        onChange={(value) =>
                          field.onChange(
                            value instanceof Date
                              ? format(value, 'yyyy-MM-dd')
                              : '',
                          )
                        }
                        format="YYYY-MM-DD"
                      />
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              ))}
              {locationFields.map(({ name, label, Select }) => (
                <Form.Field
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>{t(label)}</Form.Label>
                      <Select
                        mode="single"
                        value={field.value || undefined}
                        onValueChange={(value) => field.onChange(value ?? '')}
                      />
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              ))}
              <Form.Field
                control={form.control}
                name="amountUnit"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{tReport('amountUnit')}</Form.Label>
                    <Choice
                      label={tReport('amountUnit')}
                      value={field.value}
                      onChange={field.onChange}
                      options={['units', 'thousands'].map((value) => ({
                        value,
                        label: tReport(value),
                      }))}
                    />
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="decimals"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{tReport('decimals')}</Form.Label>
                    <Form.Control>
                      <Input
                        type="number"
                        min={0}
                        max={6}
                        {...field}
                        onChange={(event) =>
                          field.onChange(
                            event.target.value === ''
                              ? undefined
                              : Number(event.target.value),
                          )
                        }
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </Sheet.Content>
            <Sheet.Footer className="flex justify-end shrink-0 p-2.5 gap-1 bg-muted">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {tReport('cancel')}
              </Button>
              <Button type="submit">
                <IconReport />
                {tReport('run')}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
