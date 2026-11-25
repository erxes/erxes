import { zodResolver } from '@hookform/resolvers/zod';
import { Button, DatePicker, Form, Separator } from 'erxes-ui';
import { useMemo } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SelectBranches, SelectDepartments } from 'ui-modules';
import { getReportPeriodSchema } from '@/journal-reports/types/reportFormSchema';
import {
  getReportPeriodParam,
  REPORT_PERIOD_DEFAULT_TIME,
  setReportPeriodTime,
} from '@/journal-reports/utils/reportNavigation';
import { TAX_REPORT_TITLES, TaxReportKind } from '../types';

export interface TaxReportFormValues {
  kind: TaxReportKind;
  fromDate?: Date;
  toDate?: Date;
  branchId?: string;
  departmentId?: string;
}

const OPTIONAL_FILTERS = ['branchId', 'departmentId'] as const;

export const buildTaxReportPath = (values: TaxReportFormValues) => {
  const params = new URLSearchParams({ kind: values.kind });

  if (values.fromDate) {
    params.set('fromDate', getReportPeriodParam('fromDate', values.fromDate));
  }
  if (values.toDate) {
    params.set('toDate', getReportPeriodParam('toDate', values.toDate));
  }

  OPTIONAL_FILTERS.forEach((key) => {
    const value = values[key];
    if (value) params.set(key, value);
  });

  return `accounting/gen-tax-report?${params.toString()}`;
};

const PeriodField = ({
  name,
  label,
  form,
}: {
  name: 'fromDate' | 'toDate';
  label: string;
  form: UseFormReturn<TaxReportFormValues>;
}) => (
  <Form.Field
    control={form.control}
    name={name}
    render={({ field }) => (
      <Form.Item>
        <Form.Label>{label}</Form.Label>
        <DatePicker
          value={field.value}
          onChange={(next) =>
            field.onChange(
              next instanceof Date
                ? setReportPeriodTime(next, REPORT_PERIOD_DEFAULT_TIME[name])
                : undefined,
            )
          }
          format="YYYY-MM-DD"
          className="flex h-8 w-full"
        />
        <Form.Message />
      </Form.Item>
    )}
  />
);

export const TaxReportForm = ({ kind }: { kind: TaxReportKind }) => {
  const { t } = useTranslation('accounting');
  const schema = useMemo(() => getReportPeriodSchema(t), [t]);
  const form = useForm<TaxReportFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { kind },
  });

  const onSubmit = (values: TaxReportFormValues) => {
    window.open(
      buildTaxReportPath({ ...values, kind }),
      '_blank',
      'noopener,noreferrer',
    );
  };

  return (
    <div className="flex-auto overflow-auto px-6 py-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-base font-semibold">
          {t(TAX_REPORT_TITLES[kind])}
        </h2>
        <Separator className="mt-3" />
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4 pt-4"
          >
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
              <PeriodField
                name="fromDate"
                label={t('start-date')}
                form={form}
              />
              <PeriodField name="toDate" label={t('end-date')} form={form} />
            </div>
            <div className="grid grid-cols-1 gap-4 border-t pt-4 lg:grid-cols-2 xl:grid-cols-4">
              <Form.Field
                control={form.control}
                name="branchId"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('branch')}</Form.Label>
                    <SelectBranches.FormItem
                      mode="single"
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="departmentId"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('department')}</Form.Label>
                    <SelectDepartments.FormItem
                      mode="single"
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                  </Form.Item>
                )}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit">{t('view-report')}</Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};
