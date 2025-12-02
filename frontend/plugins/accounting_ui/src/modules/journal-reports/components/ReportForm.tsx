import { zodResolver } from '@hookform/resolvers/zod';
import { format, isValid, parse } from 'date-fns';
import {
  Button,
  Checkbox,
  DatePicker,
  Dialog,
  Form,
} from 'erxes-ui';
import { useAtom } from 'jotai';
import { useForm } from 'react-hook-form';
import { SelectBranches, SelectDepartments } from 'ui-modules';
import { SelectAccountCategory } from '~/modules/settings/account/account-categories/components/SelectAccountCategory';
import { activeReportState } from '../states/renderingReportsStates';
import { reportSchema, TReportForm } from '../types/reportSchema';


const getQueryParam = (key: string, value: string | string[] | Date | boolean): string => {
  if (key === 'fromDate' || key === 'toDate') {
    console.log(format(value as Date, 'yyyy-MM-dd hh:mm:ss'), 'llllllllllllll')
    return format(value as Date, 'yyyy-MM-dd hh:mm:ss');
  }

  return value as string;
}

export const ReportForm = () => {
  const [activeReport] = useAtom(activeReportState);

  const form = useForm<TReportForm>({
    resolver: zodResolver(reportSchema),
    defaultValues: {},
  });

  const onSubmit = (data: TReportForm) => {
    const params: any = { ...data };
    let result = ''

    for (const key of Object.keys(data)) {
      if (params[key]) {
        const converted = getQueryParam(key, params[key])
        console.log(converted, 'vvvvvvvvvvvvvvvvvvvvvv', key)
        result = `${result}&${key}=${converted}`;
      }
    }
    console.log(result, 'ttttttttttttttttttttt')
    window.open(
      `accounting/gen-journal-report?report=${activeReport}${result}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  if (!activeReport) {
    return null;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="py-4 grid grid-cols-2 gap-5"
      >
        <Form.Field
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Category</Form.Label>
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
              <Form.Label variant="peer">Temporary Account</Form.Label>
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
              <Form.Label variant="peer">Out of Balance</Form.Label>
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
                  format='YYYY-MM-DD'
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
          <Button type="submit" size="lg" >
            Generate Report
          </Button>
        </Dialog.Footer>
      </form>
    </Form>
  );
};
