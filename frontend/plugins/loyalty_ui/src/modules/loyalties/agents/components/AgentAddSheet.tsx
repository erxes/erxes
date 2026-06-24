import { IconPlus } from '@tabler/icons-react';
import { Button, DatePicker, Form, Input, Sheet, Checkbox } from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('loyalty');

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
          {t('add-agent')}
        </Button>
      </Sheet.Trigger>
      <Sheet.View className="sm:max-w-2xl">
        <Sheet.Header>
          <Sheet.Title>{t('new-agent')}</Sheet.Title>
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
                  rules={{ required: t('number-required') }}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>{t('number-label')}</Form.Label>
                      <Form.Control>
                        <Input placeholder={t('number')} {...field} />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />

                <Form.Field
                  control={form.control}
                  name="status"
                  rules={{ required: t('status-required') }}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>{t('status-label')}</Form.Label>
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
                    <Form.Label>{t('relevant-customers')}</Form.Label>
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
                    <Form.Label>{t('relevant-companies')}</Form.Label>
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
                    <Form.Label className="mb-2">{t('has-return')}</Form.Label>
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
                        <Form.Label>{t('return-amount')}</Form.Label>
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
                        <Form.Label>{t('return-percent')}</Form.Label>
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
                        <Form.Label>{t('prepaid-percent')}</Form.Label>
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
                        <Form.Label>{t('discount-percent')}</Form.Label>
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
                      <Form.Label>{t('start-date')}</Form.Label>
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={t('start-date')}
                      />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>{t('end-date')}</Form.Label>
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={t('end-date')}
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
                      <Form.Label>{t('start-month')}</Form.Label>
                      <MonthPicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={t('start-month')}
                      />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  control={form.control}
                  name="endMonth"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>{t('end-month')}</Form.Label>
                      <MonthPicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={t('end-month')}
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
                      <Form.Label>{t('start-day')}</Form.Label>
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={t('start-day')}
                      />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  control={form.control}
                  name="endDay"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>{t('end-day')}</Form.Label>
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={t('end-day')}
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
                    <Form.Label>{t('choose-product-rules')}</Form.Label>
                    <SelectProductRules
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder={t('choose-product-rule')}
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
                  {t('close')}
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? t('saving') : t('save')}
                </Button>
              </div>
            </form>
          </Form>
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};
