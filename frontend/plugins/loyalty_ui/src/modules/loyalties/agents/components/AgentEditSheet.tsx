import { Button, DatePicker, Form, Input, Sheet, Checkbox } from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useEditAgent } from '../hooks/useEditAgent';
import { IAgent } from '../types/agent';
import { SelectAgentStatus } from './selects/SelectAgentStatus';
import { SelectProductRules } from './selects/SelectProductRules';
import { SelectCustomer } from 'ui-modules';
import { SelectCompany } from 'ui-modules/modules/contacts/components/SelectCompany';
import { MonthPicker } from './selects/MonthPicker';

const getAgentFormValues = (agent: IAgent) => ({
  number: agent.number || '',
  status: agent.status || 'draft',
  customerIds: agent.customerIds || [],
  companyIds: agent.companyIds || [],
  hasReturn: agent.hasReturn || false,
  prepaidPercent: agent.prepaidPercent ? String(agent.prepaidPercent) : '',
  discountPercent: agent.discountPercent ? String(agent.discountPercent) : '',
  returnAmount: agent.returnAmount ? String(agent.returnAmount) : '',
  returnPercent: agent.returnPercent ? String(agent.returnPercent) : '',
  startDate: agent.startDate ? new Date(agent.startDate) : undefined,
  endDate: agent.endDate ? new Date(agent.endDate) : undefined,
  startMonth: agent.startMonth ? new Date(agent.startMonth) : undefined,
  endMonth: agent.endMonth ? new Date(agent.endMonth) : undefined,
  startDay: agent.startDay ? new Date(agent.startDay) : undefined,
  endDay: agent.endDay ? new Date(agent.endDay) : undefined,
  productRuleIds: agent.productRuleIds || [],
});

const buildAgentEditPayload = (agent: IAgent, values: AgentEditFormValues) => ({
  _id: agent._id,
  number: values.number,
  status: values.status,
  customerIds: values.customerIds.length > 0 ? values.customerIds : undefined,
  companyIds: values.companyIds.length > 0 ? values.companyIds : undefined,
  hasReturn: values.hasReturn,
  prepaidPercent: values.prepaidPercent
    ? Number(values.prepaidPercent)
    : undefined,
  discountPercent: values.discountPercent
    ? Number(values.discountPercent)
    : undefined,
  returnAmount: values.returnAmount ? Number(values.returnAmount) : undefined,
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
});

interface AgentEditFormValues {
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

interface AgentEditSheetProps {
  agent: IAgent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AgentEditSheet = ({
  agent,
  open,
  onOpenChange,
}: AgentEditSheetProps) => {
  const { agentEdit, loading } = useEditAgent();
  const { t } = useTranslation('loyalty');

  const form = useForm<AgentEditFormValues>({
    defaultValues: getAgentFormValues(agent),
  });

  const { reset } = form;
  const hasReturn = form.watch('hasReturn');

  useEffect(() => {
    if (open) {
      reset(getAgentFormValues(agent));
    }
  }, [open, agent, reset]);

  const onSubmit = async (values: AgentEditFormValues) => {
    try {
      const result = await agentEdit(
        buildAgentEditPayload(agent, values) as any,
      );
      if (result?.data) {
        onOpenChange(false);
      }
    } catch {
      // error handled in useEditAgent
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal>
      <Sheet.View className="sm:max-w-2xl">
        <Sheet.Header>
          <Sheet.Title>{t('edit-agent')}</Sheet.Title>
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
                  onClick={() => onOpenChange(false)}
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
