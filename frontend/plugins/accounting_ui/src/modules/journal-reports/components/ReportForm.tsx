import { format } from 'date-fns';
import {
  Button,
  Checkbox,
  DatePicker,
  Dialog,
  Form,
  Select,
  Separator,
} from 'erxes-ui';
import { useAtom } from 'jotai';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SelectBranches, SelectDepartments, SelectProduct } from 'ui-modules';
import { SelectCustomer } from 'ui-modules/modules/contacts';
import { SelectAccountCategory } from '~/modules/settings/account/account-categories/components/SelectAccountCategory';
import { SelectFixedAsset } from '~/modules/settings/fixed-assets/components/SelectFixedAsset';
import { activeReportState } from '../states/renderingReportsStates';
import { IReportConfig, ReportRules } from '../types/reportsMap';
import { useEffect, useMemo, useState } from 'react';
import { SelectAccount } from '~/modules/settings/account/components/SelectAccount';
import { ERKHET_TRANSACTION_TYPE_CHOICES } from '../types/erkhetTransactionTypes';

interface ReportFormValues {
  categoryId?: string;
  accountIds?: string[];
  productIds?: string[];
  fixedAssetIds?: string[];
  customerId?: string;
  branchId?: string;
  departmentId?: string;
  isTemp?: boolean;
  isOutBalance?: boolean;
  unhideZero?: boolean;
  groupKey?: string;
  trKind?: string;
  fromDate?: Date;
  toDate?: Date;
}

type ReportQueryValue = string | string[] | Date | boolean | undefined;

const getQueryParam = (
  key: string,
  value: string | string[] | Date | boolean,
): string => {
  if (key === 'fromDate' || key === 'toDate') {
    return format(value as Date, 'yyyy-MM-dd HH:mm:ss');
  }

  if (key === 'isMore' || key === 'unhideZero') {
    return 'true';
  }

  return Array.isArray(value) ? value.join(',') : `${value}`;
};

const datePickerClassName = 'h-8 flex w-full';

export const ReportForm = () => {
  const { t } = useTranslation('accounting');
  const [activeReport] = useAtom(activeReportState);
  const activeReportConf = useMemo(() => {
    return ReportRules[activeReport] || ({} as IReportConfig);
  }, [activeReport]);

  const form = useForm<ReportFormValues>({
    defaultValues: {},
  });

  const [groupKeyChoices, setGroupKeyChoices] = useState(
    activeReportConf.choices || [],
  );

  useEffect(() => {
    const choices = activeReportConf?.choices || [];
    setGroupKeyChoices(choices);
    form.setValue('groupKey', choices[0]?.code || 'default');
  }, [activeReport, activeReportConf?.choices, form]);

  const onSubmit = (data: ReportFormValues) => {
    const params: Record<string, ReportQueryValue> = {
      ...data,
      ...(activeReportConf.initParams || {}),
    };
    let result = '';

    for (const key of Object.keys(params)) {
      const value = params[key];
      if (value) {
        const converted = getQueryParam(key, value);
        result = `${result}&${key}=${converted}`;
      }
    }

    window.open(
      `accounting/gen-journal-report?report=${activeReport}${result}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  if (!activeReport) {
    return t('choose-report');
  }

  return (
    <div className="p-2 pt-8 mx-auto overflow-auto">
      {activeReportConf?.title}
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="py-4 pt-4 px-1 mx-auto grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 overflow-auto"
        >
          <Form.Field
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('account-category')}</Form.Label>
                <Form.Control>
                  <SelectAccountCategory
                    tabIndex={0}
                    selected={field.value}
                    onSelect={field.onChange}
                    recordId={field.name}
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="accountIds"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('accounts')}</Form.Label>
                <Form.Control>
                  <SelectAccount
                    value={field.value}
                    onValueChange={field.onChange}
                    mode="multiple"
                    defaultFilter={{ permissionMode: 'read' }}
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="branchId"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('branch')}</Form.Label>
                <Form.Control>
                  <SelectBranches.FormItem
                    mode="single"
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="productIds"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Бараа материал</Form.Label>
                <Form.Control>
                  <SelectProduct.FormItem
                    value={field.value}
                    onValueChange={field.onChange}
                    mode="multiple"
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="fixedAssetIds"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Үндсэн хөрөнгө</Form.Label>
                <Form.Control>
                  <SelectFixedAsset.FormItem
                    value={field.value}
                    onValueChange={field.onChange}
                    mode="multiple"
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="customerId"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Харилцагч</Form.Label>
                <Form.Control>
                  <SelectCustomer.FormItem
                    value={field.value}
                    onValueChange={field.onChange}
                    mode="single"
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="departmentId"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('department')}</Form.Label>
                <Form.Control>
                  <SelectDepartments.FormItem
                    mode="single"
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="isTemp"
            render={({ field }) => (
              <Form.Item className="flex items-center space-x-2 space-y-0 mt-4">
                <Form.Control>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </Form.Control>
                <Form.Label>{t('temporary-account')}</Form.Label>
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="isOutBalance"
            render={({ field }) => (
              <Form.Item className="flex items-center space-x-2 space-y-0 mt-4">
                <Form.Control>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </Form.Control>
                <Form.Label>Баланс бус</Form.Label>
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="unhideZero"
            render={({ field }) => (
              <Form.Item className="flex items-center space-x-2 space-y-0 mt-4">
                <Form.Control>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </Form.Control>
                <Form.Label>Хоосон мөр харуулах</Form.Label>
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="groupKey"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('group-by')}</Form.Label>
                <Form.Control>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <Select.Trigger>
                      <Select.Value placeholder={t('select-a-property-type')} />
                    </Select.Trigger>
                    <Select.Content>
                      {groupKeyChoices.map(
                        (choice: { code: string; title: string }) => (
                          <Select.Item key={choice.code} value={choice.code}>
                            {choice.title}
                          </Select.Item>
                        ),
                      )}
                    </Select.Content>
                  </Select>
                </Form.Control>
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="trKind"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Гүйлгээний төрөл</Form.Label>
                <Form.Control>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <Select.Trigger>
                      <Select.Value placeholder="Бүгд" />
                    </Select.Trigger>
                    <Select.Content>
                      {ERKHET_TRANSACTION_TYPE_CHOICES.map((choice) => (
                        <Select.Item key={choice.code} value={choice.code}>
                          {choice.title}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </Form.Control>
              </Form.Item>
            )}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2 xl:col-span-2">
            <Form.Field
              control={form.control}
              name="fromDate"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('from-date')}</Form.Label>
                  <Form.Control>
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      format="YYYY-MM-DD"
                      className={datePickerClassName}
                    />
                  </Form.Control>
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="toDate"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('to-date')}</Form.Label>
                  <Form.Control>
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      format="YYYY-MM-DD"
                      className={datePickerClassName}
                    />
                  </Form.Control>
                </Form.Item>
              )}
            />
          </div>
          <Dialog.Footer className="mt-4 lg:col-span-2 xl:col-span-4">
            <Button type="submit" size="lg">
              {t('generate-report')}
            </Button>
          </Dialog.Footer>
        </form>
      </Form>
    </div>
  );
};
