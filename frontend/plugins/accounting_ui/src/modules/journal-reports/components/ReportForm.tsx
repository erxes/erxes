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
import { SelectBranches, SelectDepartments } from 'ui-modules';
import { SelectAccountCategory } from '~/modules/settings/account/account-categories/components/SelectAccountCategory';
import { activeReportState } from '../states/renderingReportsStates';
import { IReportConfig, ReportRules } from '../types/reportsMap';
import { useEffect, useMemo, useState } from 'react';
import { SelectAccount } from '~/modules/settings/account/components/SelectAccount';

const getQueryParam = (
  key: string,
  value: string | string[] | Date | boolean,
): string => {
  if (key === 'fromDate' || key === 'toDate') {
    return format(value as Date, 'yyyy-MM-dd hh:mm:ss'); // date.isoString // new Date().toISOString();
  }

  if (key === 'isMore') {
    return 'true';
  }

  return value as string;
};

export const ReportForm = () => {
  const [activeReport] = useAtom(activeReportState);
  const activeReportConf = useMemo(() => {
    return ReportRules[activeReport] || ({} as IReportConfig);
  }, [activeReport]);

  const form = useForm<any>({
    defaultValues: {},
  });

  const [groupKeyChoices, setGroupKeyChoices] = useState(
    activeReportConf.choices || [],
  );

  useEffect(() => {
    setGroupKeyChoices(activeReportConf?.choices || []);
    form.setValue(`groupKey`, 'default');
  }, [activeReport]);

  const onSubmit = (data: any) => {
    const params: any = { ...data, ...(activeReportConf.initParams || {}) };
    let result = '';

    for (const key of Object.keys(params)) {
      if (params[key]) {
        const converted = getQueryParam(key, params[key]);
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
    return 'Choose report'; // report handbook
  }

  return (
    <div className="p-2 pt-8 mx-auto overflow-auto">
      {activeReportConf?.title}
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="py-4 pt-4 px-1 mx-auto grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-5 overflow-auto"
        >
          <Form.Field
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Account Category</Form.Label>
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
                <Form.Label>Accounts</Form.Label>
                <Form.Control>
                  <SelectAccount
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
            name="branchId"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Branch</Form.Label>
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
            name="departmentId"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Department</Form.Label>
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
                <Form.Label>Temporary Account</Form.Label>
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
                <Form.Label>Out of Balance</Form.Label>
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="groupKey"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Group by</Form.Label>
                <Form.Control>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <Select.Trigger>
                      <Select.Value placeholder="Select a property type" />
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
            name="fromDate"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>From Date</Form.Label>
                <Form.Control>
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    format="YYYY-MM-DD"
                    className="h-8 flex w-full"
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
                <Form.Label>To Date</Form.Label>
                <Form.Control>
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    className="h-8 flex w-full"
                  />
                </Form.Control>
              </Form.Item>
            )}
          />
          <Dialog.Footer className="col-span-2 mt-4">
            <Button type="submit" size="lg">
              Generate Report
            </Button>
          </Dialog.Footer>
        </form>
      </Form>
    </div>
  );
};
