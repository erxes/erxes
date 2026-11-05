import { zodResolver } from '@hookform/resolvers/zod';
import { AccountingEmptyState } from '@/layout/components/AccountingEmptyState';
import { IconReport } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Checkbox,
  DatePicker,
  Dialog,
  Form,
  IconComponent,
  Input,
  Select,
  Separator,
} from 'erxes-ui';
import { useAtom } from 'jotai';
import { useEffect, useMemo } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import {
  SelectBranches,
  SelectCategory,
  SelectDepartments,
  SelectMember,
  SelectProduct,
  SelectTags,
} from 'ui-modules';
import { SelectCustomer } from 'ui-modules/modules/contacts';
import { SelectAccountCategory } from '~/modules/settings/account/account-categories/components/SelectAccountCategory';
import { SelectAccount } from '~/modules/settings/account/components/SelectAccount';
import { SelectFixedAssetCategory } from '~/modules/settings/fixed-assets/components/SelectFixedAssetCategory';
import { SelectFixedAsset } from '~/modules/settings/fixed-assets/components/SelectFixedAsset';
import { activeReportState } from '@/journal-reports/states/renderingReportsStates';
import { ERKHET_TRANSACTION_TYPE_CHOICES } from '@/journal-reports/types/erkhetTransactionTypes';
import {
  getReportFilterDefinitions,
  REPORT_FILTER_GROUP_ORDER,
  ReportFilterDefinition,
} from '@/journal-reports/types/reportFilters';
import { getReportPeriodSchema } from '@/journal-reports/types/reportFormSchema';
import { getReportPeriodParam } from '@/journal-reports/utils/reportNavigation';
import { IReportConfig, ReportRules } from '@/journal-reports/types/reportsMap';

interface ReportFormValues {
  accountCategoryId?: string;
  accountIds?: string[];
  customerId?: string;
  customerTagIds?: string[];
  companyTagIds?: string[];
  productCategoryId?: string;
  productIds?: string[];
  productSearchValue?: string;
  fixedAssetCategoryId?: string;
  fixedAssetIds?: string[];
  fixedAssetSearchValue?: string;
  branchId?: string;
  departmentId?: string;
  createdUserId?: string;
  modifiedUserId?: string;
  assignedUserId?: string;
  isTemp?: boolean;
  isOutBalance?: boolean;
  isMore?: boolean;
  unhideZero?: boolean;
  groupKey?: string;
  trKind?: string;
  fromDate?: Date;
  toDate?: Date;
}

type ReportQueryValue = string | string[] | Date | boolean | undefined;

const getQueryParam = (
  key: string,
  value: Exclude<ReportQueryValue, undefined>,
) => {
  if (key === 'fromDate' || key === 'toDate') {
    return getReportPeriodParam(key, value as Date);
  }

  if (typeof value === 'boolean') {
    return String(value);
  }

  return Array.isArray(value) ? value.join(',') : String(value);
};

const hasQueryValue = (
  value: ReportQueryValue,
): value is Exclude<ReportQueryValue, undefined> =>
  value instanceof Date ||
  value === true ||
  (typeof value === 'string' && value.length > 0) ||
  (Array.isArray(value) && value.length > 0);

const datePickerClassName = 'h-8 flex w-full';

const ReportFormField = ({
  definition,
  form,
  reportConfig,
}: {
  definition: ReportFilterDefinition;
  form: UseFormReturn<ReportFormValues>;
  reportConfig: IReportConfig;
}) => {
  const { t } = useTranslation('accounting');
  const { field, label: labelKey } = definition;
  const label = t(labelKey);

  if (field === 'accountCategoryId') {
    return (
      <Form.Field
        control={form.control}
        name={field}
        render={({ field: control }) => (
          <Form.Item>
            <Form.Label>{label}</Form.Label>
            <Form.Control>
              <SelectAccountCategory
                selected={control.value}
                onSelect={control.onChange}
                recordId={control.name}
              />
            </Form.Control>
          </Form.Item>
        )}
      />
    );
  }

  if (field === 'accountIds') {
    return (
      <Form.Field
        control={form.control}
        name={field}
        render={({ field: control }) => (
          <Form.Item>
            <Form.Label>{label}</Form.Label>
            <SelectAccount
              value={control.value}
              onValueChange={control.onChange}
              mode="multiple"
              defaultFilter={{ permissionMode: 'read' }}
            />
          </Form.Item>
        )}
      />
    );
  }

  if (field === 'branchId' || field === 'departmentId') {
    const StructureSelect =
      field === 'branchId'
        ? SelectBranches.FormItem
        : SelectDepartments.FormItem;
    return (
      <Form.Field
        control={form.control}
        name={field}
        render={({ field: control }) => (
          <Form.Item>
            <Form.Label>{label}</Form.Label>
            <StructureSelect
              mode="single"
              value={control.value}
              onValueChange={control.onChange}
            />
          </Form.Item>
        )}
      />
    );
  }

  if (field === 'customerId') {
    return (
      <Form.Field
        control={form.control}
        name={field}
        render={({ field: control }) => (
          <Form.Item>
            <Form.Label>{label}</Form.Label>
            <SelectCustomer.FormItem
              value={control.value}
              onValueChange={control.onChange}
              mode="single"
            />
          </Form.Item>
        )}
      />
    );
  }

  if (field === 'customerTagIds' || field === 'companyTagIds') {
    return (
      <Form.Field
        control={form.control}
        name={field}
        render={({ field: control }) => (
          <Form.Item>
            <Form.Label>{label}</Form.Label>
            <SelectTags.FormItem
              tagType={
                field === 'customerTagIds' ? 'core:customer' : 'core:company'
              }
              value={control.value}
              onValueChange={control.onChange}
              mode="multiple"
            />
          </Form.Item>
        )}
      />
    );
  }

  if (field === 'productCategoryId') {
    return (
      <Form.Field
        control={form.control}
        name={field}
        render={({ field: control }) => (
          <Form.Item>
            <Form.Label>{label}</Form.Label>
            <SelectCategory.FormItem
              mode="single"
              value={control.value}
              onValueChange={control.onChange}
            />
          </Form.Item>
        )}
      />
    );
  }

  if (field === 'productIds') {
    return (
      <Form.Field
        control={form.control}
        name={field}
        render={({ field: control }) => (
          <Form.Item>
            <Form.Label>{label}</Form.Label>
            <SelectProduct.FormItem
              value={control.value}
              onValueChange={control.onChange}
              mode="multiple"
            />
          </Form.Item>
        )}
      />
    );
  }

  if (field === 'fixedAssetCategoryId') {
    return (
      <Form.Field
        control={form.control}
        name={field}
        render={({ field: control }) => (
          <Form.Item>
            <Form.Label>{label}</Form.Label>
            <SelectFixedAssetCategory
              selected={control.value}
              onSelect={control.onChange}
              nullable
            />
          </Form.Item>
        )}
      />
    );
  }

  if (field === 'fixedAssetIds') {
    return (
      <Form.Field
        control={form.control}
        name={field}
        render={({ field: control }) => (
          <Form.Item>
            <Form.Label>{label}</Form.Label>
            <SelectFixedAsset.FormItem
              value={control.value}
              onValueChange={control.onChange}
              mode="multiple"
            />
          </Form.Item>
        )}
      />
    );
  }

  if (field === 'productSearchValue' || field === 'fixedAssetSearchValue') {
    return (
      <Form.Field
        control={form.control}
        name={field}
        render={({ field: control }) => (
          <Form.Item>
            <Form.Label>{label}</Form.Label>
            <Form.Control>
              <Input {...control} value={control.value || ''} />
            </Form.Control>
          </Form.Item>
        )}
      />
    );
  }

  if (
    field === 'createdUserId' ||
    field === 'modifiedUserId' ||
    field === 'assignedUserId'
  ) {
    return (
      <Form.Field
        control={form.control}
        name={field}
        render={({ field: control }) => (
          <Form.Item>
            <Form.Label>{label}</Form.Label>
            <SelectMember.FormItem
              mode="single"
              value={control.value}
              onValueChange={control.onChange}
            />
          </Form.Item>
        )}
      />
    );
  }

  if (field === 'trKind') {
    return (
      <Form.Field
        control={form.control}
        name={field}
        render={({ field: control }) => (
          <Form.Item>
            <Form.Label>{label}</Form.Label>
            <Select value={control.value} onValueChange={control.onChange}>
              <Select.Trigger>
                <Select.Value placeholder={t('all')} />
              </Select.Trigger>
              <Select.Content>
                {ERKHET_TRANSACTION_TYPE_CHOICES.map((choice) => (
                  <Select.Item key={choice.code} value={choice.code}>
                    {t(choice.title || '')}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </Form.Item>
        )}
      />
    );
  }

  if (field === 'groupKey') {
    return (
      <Form.Field
        control={form.control}
        name={field}
        render={({ field: control }) => (
          <Form.Item>
            <Form.Label>{label}</Form.Label>
            <Select value={control.value} onValueChange={control.onChange}>
              <Select.Trigger>
                <Select.Value placeholder={t('grouping-method')} />
              </Select.Trigger>
              <Select.Content>
                {(reportConfig.choices || []).map((choice) => (
                  <Select.Item key={choice.code} value={choice.code}>
                    {t(choice.title || '')}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </Form.Item>
        )}
      />
    );
  }

  if (field === 'fromDate' || field === 'toDate') {
    return (
      <Form.Field
        control={form.control}
        name={field}
        render={({ field: control }) => (
          <Form.Item>
            <Form.Label>{label}</Form.Label>
            <DatePicker
              value={control.value}
              onChange={control.onChange}
              format="YYYY-MM-DD"
              className={datePickerClassName}
            />
            <Form.Message />
          </Form.Item>
        )}
      />
    );
  }

  return (
    <Form.Field
      control={form.control}
      name={field}
      render={({ field: control }) => (
        <Form.Item className="flex items-center gap-2 space-y-0 pt-6">
          <Checkbox
            checked={Boolean(control.value)}
            onCheckedChange={control.onChange}
          />
          <Form.Label>{label}</Form.Label>
        </Form.Item>
      )}
    />
  );
};

const ReportFormFieldGroup = ({
  definitions,
  form,
  reportConfig,
}: {
  definitions: ReportFilterDefinition[];
  form: UseFormReturn<ReportFormValues>;
  reportConfig: IReportConfig;
}) => {
  if (!definitions.length) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-4 border-b py-4 last:border-0 lg:grid-cols-2 xl:grid-cols-4">
      {definitions.map((definition) => (
        <ReportFormField
          key={definition.field}
          definition={definition}
          form={form}
          reportConfig={reportConfig}
        />
      ))}
    </div>
  );
};

const ReportFilterForm = ({
  definitions,
  form,
  reportConfig,
  canSubmit,
  onSubmit,
}: {
  definitions: ReportFilterDefinition[];
  form: UseFormReturn<ReportFormValues>;
  reportConfig: IReportConfig;
  canSubmit: boolean;
  onSubmit: (data: ReportFormValues) => void;
}) => {
  const { t } = useTranslation('accounting');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="py-4">
        {REPORT_FILTER_GROUP_ORDER.map((group) => (
          <ReportFormFieldGroup
            key={group}
            definitions={definitions.filter(
              (definition) => definition.group === group,
            )}
            form={form}
            reportConfig={reportConfig}
          />
        ))}
        <Dialog.Footer className="mt-4">
          <Button type="submit" size="lg" disabled={!canSubmit}>
            {t('view-report')}
          </Button>
        </Dialog.Footer>
      </form>
    </Form>
  );
};

const COMMON_REPORT_KEYS = ['ac', 'tb', 'mb'];

export const ReportForm = () => {
  const { t } = useTranslation('accounting');
  const [activeReport, setActiveReport] = useAtom(activeReportState);
  const reportConfig = useMemo(
    () => ReportRules[activeReport] || ({} as IReportConfig),
    [activeReport],
  );
  const definitions = useMemo(
    () => getReportFilterDefinitions(activeReport),
    [activeReport],
  );
  const allowedFields = useMemo(
    () => new Set(definitions.map(({ field }) => field)),
    [definitions],
  );
  const periodSchema = useMemo(() => getReportPeriodSchema(t), [t]);
  const form = useForm<ReportFormValues>({
    defaultValues: {},
    resolver: zodResolver(periodSchema),
  });

  useEffect(() => {
    form.reset({
      groupKey: reportConfig.choices?.[0]?.code || 'default',
    });
  }, [activeReport, form, reportConfig.choices]);

  const onSubmit = (data: ReportFormValues) => {
    const params = new URLSearchParams({ report: activeReport });

    definitions.forEach(({ field, queryParam }) => {
      const value = data[field] as ReportQueryValue;
      if (hasQueryValue(value)) {
        params.set(queryParam, getQueryParam(queryParam, value));
      }
    });

    Object.entries(reportConfig.initParams || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== false) {
        params.set(key, String(value));
      }
    });

    window.open(
      `accounting/gen-journal-report?${params.toString()}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  if (!activeReport) {
    return (
      <AccountingEmptyState
        icon={IconReport}
        title={t('select-a-report')}
        description={t('select-a-report-description')}
        className="flex-auto"
        action={
          <div className="flex flex-wrap justify-center gap-2">
            {COMMON_REPORT_KEYS.map((reportKey) => (
              <Button
                key={reportKey}
                variant="secondary"
                onClick={() => setActiveReport(reportKey)}
              >
                {ReportRules[reportKey].icon ? (
                  <IconComponent name={ReportRules[reportKey].icon} />
                ) : (
                  <IconReport />
                )}
                {t(ReportRules[reportKey].title || '')}
              </Button>
            ))}
          </div>
        }
      />
    );
  }

  return (
    <div className="flex-auto overflow-auto px-6 py-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-base font-semibold">
          {t(reportConfig.title || '')}
        </h2>
        <Separator className="mt-3" />
        <ReportFilterForm
          definitions={definitions}
          form={form}
          reportConfig={reportConfig}
          canSubmit={allowedFields.size > 0}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
};
