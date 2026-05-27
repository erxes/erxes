import { IconPlus } from '@tabler/icons-react';
import { Button, DatePicker, Form, Input, Sheet, Checkbox } from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAddAgent } from '../hooks/useAddAgent';
import { SelectAgentStatus } from './selects/SelectAgentStatus';
import { SelectProductRules } from './selects/SelectProductRules';
import { SelectCustomer } from 'ui-modules';
import { SelectCompany } from 'ui-modules/modules/contacts/components/SelectCompany';
import { MonthPicker } from './selects/MonthPicker';

interface AgentAddFormValues {
  number: string;
  status: string;
  customerIds: string[];
  companyIds: string[];
  hasReturn: boolean;
  prepaidPercent: string;
  discountPercent: string;
  returnAmount: string;
  returnPercent: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  startMonth: Date | undefined;
  endMonth: Date | undefined;
  startDay: Date | undefined;
  endDay: Date | undefined;
  productRuleIds: string[];
}

export const AgentAddSheet = () => {
  const [open, setOpen] = useState(false);
  const { agentAdd, loading } = useAddAgent();

  const form = useForm<AgentAddFormValues>({
    defaultValues: {
      number: '',
      status: 'draft',
      customerIds: [],
      companyIds: [],
      hasReturn: false,
      prepaidPercent: '',
      discountPercent: '',
      returnAmount: '',
      returnPercent: '',
      startDate: undefined,
      endDate: undefined,
      startMonth: undefined,
      endMonth: undefined,
      startDay: undefined,
      endDay: undefined,
      productRuleIds: [],
    },
  });

  const hasReturn = form.watch('hasReturn');

  const onSubmit = async (values: AgentAddFormValues) => {
    try {
      const result = await agentAdd({
        number: values.number,
        status: values.status,
        customerIds:
          values.customerIds.length > 0 ? values.customerIds : undefined,
        companyIds:
          values.companyIds.length > 0 ? values.companyIds : undefined,
        hasReturn: values.hasReturn,
        prepaidPercent: values.prepaidPercent
          ? Number(values.prepaidPercent)
          : undefined,
        discountPercent: values.discountPercent
          ? Number(values.discountPercent)
          : undefined,
        returnAmount: values.returnAmount
          ? Number(values.returnAmount)
          : undefined,
        returnPercent: values.returnPercent
          ? Number(values.returnPercent)
          : undefined,
        startDate: values.startDate,
        endDate: values.endDate,
        startMonth: values.startMonth,
        endMonth: values.endMonth,
        startDay: values.startDay,
        endDay: values.endDay,
        productRuleIds:
          values.productRuleIds.length > 0 ? values.productRuleIds : undefined,
      } as any);
      if (result?.data) {
        setOpen(false);
        form.reset();
      }
    } catch {
      // error handled in useAddAgent
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen} modal>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          Add agent
        </Button>
      </Sheet.Trigger>
      <Sheet.View className="sm:max-w-2xl">
        <Sheet.Header>
          <Sheet.Title>New agent</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="p-5 overflow-y-auto">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <Form.Field
                  control={form.control}
                  name="number"
                  rules={{ required: 'Number is required' }}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Number *</Form.Label>
                      <Form.Control>
                        <Input placeholder="Number" {...field} />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />

                <Form.Field
                  control={form.control}
                  name="status"
                  rules={{ required: 'Status is required' }}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Status *</Form.Label>
                      <SelectAgentStatus.FormItem
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="draft"
                      />
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              </div>

              <Form.Field
                control={form.control}
                name="customerIds"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Relevant Customers</Form.Label>
                    <Form.Control>
                      <SelectCustomer
                        value={field.value}
                        onValueChange={(val) => field.onChange(val)}
                        mode="multiple"
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="companyIds"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Relevant Companies</Form.Label>
                    <Form.Control>
                      <SelectCompany
                        value={field.value}
                        onValueChange={(val) => field.onChange(val)}
                        mode="multiple"
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="hasReturn"
                render={({ field }) => (
                  <Form.Item className="flex flex-row items-center gap-3">
                    <Form.Control>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </Form.Control>
                    <Form.Label className="mb-2">Has Return</Form.Label>
                  </Form.Item>
                )}
              />

              {hasReturn ? (
                <div className="grid grid-cols-2 gap-4">
                  <Form.Field
                    control={form.control}
                    name="returnAmount"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Return Amount</Form.Label>
                        <Input.Number
                          placeholder="0"
                          value={field.value ? Number(field.value) : undefined}
                          onChange={(v) =>
                            field.onChange(v === '' ? '' : String(v))
                          }
                          onBlur={field.onBlur}
                        />
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                  <Form.Field
                    control={form.control}
                    name="returnPercent"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Return Percent</Form.Label>
                        <Input.Number
                          placeholder="0"
                          value={field.value ? Number(field.value) : undefined}
                          onChange={(v) =>
                            field.onChange(v === '' ? '' : String(v))
                          }
                          onBlur={field.onBlur}
                        />
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <Form.Field
                    control={form.control}
                    name="prepaidPercent"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Prepaid Percent</Form.Label>
                        <Input.Number
                          placeholder="0"
                          value={field.value ? Number(field.value) : undefined}
                          onChange={(v) =>
                            field.onChange(v === '' ? '' : String(v))
                          }
                          onBlur={field.onBlur}
                        />
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                  <Form.Field
                    control={form.control}
                    name="discountPercent"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Discount Percent</Form.Label>
                        <Input.Number
                          placeholder="0"
                          value={field.value ? Number(field.value) : undefined}
                          onChange={(v) =>
                            field.onChange(v === '' ? '' : String(v))
                          }
                          onBlur={field.onBlur}
                        />
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Form.Field
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Start Date</Form.Label>
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Start Date"
                      />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>End Date</Form.Label>
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="End Date"
                      />
                    </Form.Item>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Form.Field
                  control={form.control}
                  name="startMonth"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Start Month</Form.Label>
                      <MonthPicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Start Month"
                      />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  control={form.control}
                  name="endMonth"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>End Month</Form.Label>
                      <MonthPicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="End Month"
                      />
                    </Form.Item>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Form.Field
                  control={form.control}
                  name="startDay"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Start Day</Form.Label>
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Start Day"
                      />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  control={form.control}
                  name="endDay"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>End Day</Form.Label>
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="End Day"
                      />
                    </Form.Item>
                  )}
                />
              </div>

              <Form.Field
                control={form.control}
                name="productRuleIds"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Choose Product Rules</Form.Label>
                    <SelectProductRules
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Choose product rule"
                    />
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Close
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </Form>
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};
