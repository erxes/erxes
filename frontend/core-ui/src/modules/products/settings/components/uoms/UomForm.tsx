import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Checkbox,
  Form,
  Input,
  Select,
  Sheet,
  useToast,
} from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { IUom } from 'ui-modules';
import { useUomsAdd } from '../../hooks/useUomsAdd';
import { useUomsEdit } from '../../hooks/useUomsEdit';
import { useTranslation } from 'react-i18next';

const TIMELY_OPTIONS = [
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
];

const TIMELY_PERIODS = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Seasonally', value: 'seasonally' },
];

const SUBSCRIPTION_RULES = [
  { label: 'Start From Paid Date', value: 'startPaidDate' },
  { label: 'Start from Expired Date', value: 'startExpiredDate' },
  { label: 'Start from Specific Date', value: 'startSpecificDate' },
];

const uomFormSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    code: z.string().min(1, 'Code is required'),
    isForSubscription: z.boolean().default(false),
    subscriptionPeriod: z.string().optional(),
    subscriptionRule: z.string().optional(),
    subscriptionRenewable: z.boolean().default(false),
    subscriptionSpecificDay: z.string().optional(),
    isTimely: z.boolean().default(false),
    timely: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.isForSubscription) {
      if (!value.subscriptionPeriod) {
        ctx.addIssue({
          path: ['subscriptionPeriod'],
          code: z.ZodIssueCode.custom,
          message: 'Subscription period is required',
        });
      }
      if (value.subscriptionPeriod && !value.subscriptionRule) {
        ctx.addIssue({
          path: ['subscriptionRule'],
          code: z.ZodIssueCode.custom,
          message: 'Subscription rule is required',
        });
      }
      if (
        value.subscriptionPeriod &&
        value.subscriptionRule === 'startSpecificDate' &&
        !value.subscriptionSpecificDay
      ) {
        ctx.addIssue({
          path: ['subscriptionSpecificDay'],
          code: z.ZodIssueCode.custom,
          message: 'Please select a day',
        });
      }
    }

    if (value.isTimely && !value.timely) {
      ctx.addIssue({
        path: ['timely'],
        code: z.ZodIssueCode.custom,
        message: 'Timely period is required',
      });
    }
  });

interface IUomFormProps {
  uom?: IUom;
  onOpenChange?: (open: boolean) => void;
}

export const UomForm = ({ uom, onOpenChange }: IUomFormProps) => {
  const { toast } = useToast();
  const { t } = useTranslation('product', {
    keyPrefix: 'add',
  });
  const { uomsAdd, loading: loadingAdd } = useUomsAdd();
  const { uomsEdit, loading: loadingEdit } = useUomsEdit();

  const form = useForm<
    z.infer<typeof uomFormSchema> & {
      subscriptionSpecificDay?: string;
    }
  >({
    defaultValues: {
      name: uom?.name || '',
      code: uom?.code || '',
      isForSubscription: Boolean((uom as any)?.isForSubscription),
      subscriptionPeriod: (uom as any)?.subscriptionConfig?.period || '',
      subscriptionRule: (uom as any)?.subscriptionConfig?.rule || '',
      subscriptionRenewable: Boolean(
        (uom as any)?.subscriptionConfig?.subsRenewable,
      ),
      subscriptionSpecificDay: (uom as any)?.subscriptionConfig?.specificDay,
      isTimely: Boolean((uom as any)?.timely),
      timely: (uom as any)?.timely || '',
    },
    resolver: zodResolver(uomFormSchema),
  });

  const isForSubscription = form.watch('isForSubscription');
  const subscriptionPeriod = form.watch('subscriptionPeriod');
  const subscriptionRule = form.watch('subscriptionRule');
  const isTimely = form.watch('isTimely');

  const handleCancel = () => {
    form.reset();
    onOpenChange?.(false);
  };

  const onSubmit = (
    data: z.infer<typeof uomFormSchema> & {
      subscriptionSpecificDay?: string;
    },
  ) => {
    const {
      isForSubscription,
      subscriptionPeriod,
      subscriptionRule,
      subscriptionSpecificDay,
      subscriptionRenewable,
      isTimely,
      timely,
      ...rest
    } = data;

    const payload = {
      ...rest,
      isForSubscription,
      subscriptionConfig: isForSubscription
        ? {
            period: subscriptionPeriod,
            rule: subscriptionRule,
            subsRenewable: subscriptionRenewable,
            ...(subscriptionRule === 'startSpecificDate'
              ? { specificDay: subscriptionSpecificDay }
              : {}),
          }
        : null,
      timely: isTimely ? timely : null,
    };

    if (uom) {
      uomsEdit({
        variables: { id: uom._id, ...payload },
        onCompleted: () => {
          onOpenChange?.(false);
        },
        onError: (e) => {
          toast({
            title: 'Error',
            description: e.message,
            variant: 'destructive',
          });
        },
      });
    } else {
      uomsAdd({
        variables: { ...payload },
        onCompleted: () => {
          form.reset();
          onOpenChange?.(false);
        },
        onError: (e) => {
          toast({
            title: 'Error',
            description: e.message,
            variant: 'destructive',
          });
        },
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex overflow-hidden flex-col h-full"
      >
        <Sheet.Header className="flex-row gap-3 items-center p-5 space-y-0 border-b">
          <Sheet.Title>{uom ? t('edit-uom') : t('add-uom')}</Sheet.Title>
          <Sheet.Close />
          <Sheet.Description className="sr-only">
            {uom ? t('edit-uom') : t('add-uom')}
          </Sheet.Description>
        </Sheet.Header>
        <Sheet.Content className="overflow-hidden flex-auto">
          <div className="flex flex-col gap-6 p-5 w-full">
            <div className="flex gap-2 w-full">
              <Form.Field
                control={form.control}
                name="name"
                render={({ field }) => (
                  <Form.Item className="w-full">
                    <Form.Label>
                      {t('name')} <span className="text-destructive">*</span>
                    </Form.Label>
                    <Form.Control>
                      <Input placeholder={t('name')} {...field} autoFocus />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="code"
                render={({ field }) => (
                  <Form.Item className="w-full">
                    <Form.Label>
                      {t('code')} <span className="text-destructive">*</span>
                    </Form.Label>
                    <Form.Control>
                      <Input
                        placeholder={t('code')}
                        {...field}
                        className="w-full"
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </div>

            <div className="space-y-3">
              <Form.Field
                control={form.control}
                name="isForSubscription"
                render={({ field }) => (
                  <Form.Item>
                    <div className="flex gap-2 items-center">
                      <Checkbox
                        id="isForSubscription"
                        checked={field.value}
                        onCheckedChange={(checked) =>
                          field.onChange(checked === true)
                        }
                      />
                      <Form.Label
                        className="cursor-pointer"
                        htmlFor="isForSubscription"
                      >
                        {t('uom-for-subscription', {
                          defaultValue: 'UOM for subscription',
                        })}
                      </Form.Label>
                    </div>
                  </Form.Item>
                )}
              />

              {isForSubscription && (
                <div className="p-4 space-y-4 rounded-md border">
                  <Form.Field
                    control={form.control}
                    name="subscriptionPeriod"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>
                          {t('subscription-period', {
                            defaultValue: 'Subscription Period',
                          })}{' '}
                          <span className="text-destructive">*</span>
                        </Form.Label>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <Form.Control>
                            <Select.Trigger>
                              <Select.Value
                                placeholder={t('choose', {
                                  defaultValue: 'Choose period',
                                })}
                              >
                                {TIMELY_OPTIONS.find(
                                  (option) => option.value === field.value,
                                )?.label || ''}
                              </Select.Value>
                            </Select.Trigger>
                          </Form.Control>
                          <Select.Content>
                            {TIMELY_OPTIONS.map((option) => (
                              <Select.Item
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />

                  {subscriptionPeriod && (
                    <Form.Field
                      control={form.control}
                      name="subscriptionRule"
                      render={({ field }) => (
                        <Form.Item className="space-y-2">
                          <Form.Label>
                            {t('subscription-rule', {
                              defaultValue: 'Subscription Rule',
                            })}{' '}
                            <span className="text-destructive">*</span>
                          </Form.Label>
                          <Form.Control>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <Select.Trigger>
                                <Select.Value
                                  placeholder={t('subscription-rule', {
                                    defaultValue: 'Select subscription rule',
                                  })}
                                />
                              </Select.Trigger>
                              <Select.Content>
                                {SUBSCRIPTION_RULES.map((rule) => (
                                  <Select.Item
                                    key={rule.value}
                                    value={rule.value}
                                  >
                                    {rule.label}
                                  </Select.Item>
                                ))}
                              </Select.Content>
                            </Select>
                          </Form.Control>
                          <Form.Message />
                        </Form.Item>
                      )}
                    />
                  )}

                  <Form.Field
                    control={form.control}
                    name="subscriptionRenewable"
                    render={({ field }) => (
                      <Form.Item>
                        <div className="flex gap-2 items-center">
                          <Checkbox
                            id="subscriptionRenewable"
                            checked={field.value}
                            onCheckedChange={(checked) =>
                              field.onChange(checked === true)
                            }
                          />
                          <Form.Label
                            className="mb-0 cursor-pointer"
                            htmlFor="subscriptionRenewable"
                          >
                            {t('subscription-renewable', {
                              defaultValue:
                                'Is able subscription renew before close',
                            })}
                          </Form.Label>
                        </div>
                      </Form.Item>
                    )}
                  />

                  {subscriptionRule === 'startSpecificDate' && (
                    <div className="space-y-2">
                      <Form.Label>
                        {subscriptionPeriod === 'weekly'
                          ? t('select-day', { defaultValue: 'Select a day' })
                          : t('select-date', {
                              defaultValue: 'Select date',
                            })}{' '}
                        <span className="text-destructive">*</span>
                      </Form.Label>
                      {subscriptionPeriod === 'weekly' ? (
                        <Form.Field
                          control={form.control}
                          name="subscriptionSpecificDay"
                          render={({ field }) => (
                            <Form.Item>
                              <Form.Control>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <Select.Trigger>
                                    <Select.Value
                                      placeholder={t('select-day', {
                                        defaultValue: 'Select a day',
                                      })}
                                    />
                                  </Select.Trigger>
                                  <Select.Content>
                                    {[
                                      'monday',
                                      'tuesday',
                                      'wednesday',
                                      'thursday',
                                      'friday',
                                      'saturday',
                                      'sunday',
                                    ].map((day) => (
                                      <Select.Item key={day} value={day}>
                                        {day.charAt(0).toUpperCase() +
                                          day.slice(1)}
                                      </Select.Item>
                                    ))}
                                  </Select.Content>
                                </Select>
                              </Form.Control>
                              <Form.Message />
                            </Form.Item>
                          )}
                        />
                      ) : (
                        <Form.Field
                          control={form.control}
                          name="subscriptionSpecificDay"
                          render={({ field }) => (
                            <Form.Item>
                              <Form.Label className="text-[10px] text-muted-foreground">
                                {t('select-date-helper', {
                                  defaultValue:
                                    'If you select the 31st day, months with 28, 29 or 30 days will use the last day of that month.',
                                })}
                              </Form.Label>
                              <Form.Control>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <Select.Trigger>
                                    <Select.Value
                                      placeholder={t('select-day', {
                                        defaultValue: 'Select a day',
                                      })}
                                    />
                                  </Select.Trigger>
                                  <Select.Content>
                                    {Array.from({ length: 31 }, (_, idx) =>
                                      String(idx + 1),
                                    ).map((day) => (
                                      <Select.Item key={day} value={day}>
                                        {day}
                                      </Select.Item>
                                    ))}
                                  </Select.Content>
                                </Select>
                              </Form.Control>
                              <Form.Message />
                            </Form.Item>
                          )}
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Form.Field
                control={form.control}
                name="isTimely"
                render={({ field }) => (
                  <Form.Item>
                    <div className="flex gap-2 items-center">
                      <Checkbox
                        id="isTimely"
                        checked={field.value}
                        onCheckedChange={(checked) =>
                          field.onChange(checked === true)
                        }
                      />
                      <Form.Label
                        className="mb-0 cursor-pointer"
                        htmlFor="isTimely"
                      >
                        {t('uom-for-timely', {
                          defaultValue: 'UOM for timely',
                        })}
                      </Form.Label>
                    </div>
                  </Form.Item>
                )}
              />

              {isTimely && (
                <Form.Field
                  control={form.control}
                  name="timely"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>
                        {t('timely-period', { defaultValue: 'Timely period' })}{' '}
                        <span className="text-destructive">*</span>
                      </Form.Label>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <Form.Control>
                          <Select.Trigger>
                            <Select.Value
                              placeholder={t('choose', {
                                defaultValue: 'Choose period',
                              })}
                            >
                              {TIMELY_PERIODS.find(
                                (option) => option.value === field.value,
                              )?.label || ''}
                            </Select.Value>
                          </Select.Trigger>
                        </Form.Control>
                        <Select.Content>
                          {TIMELY_PERIODS.map((option) => (
                            <Select.Item
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              )}
            </div>
          </div>
        </Sheet.Content>
        <Sheet.Footer className="flex justify-end shrink-0 p-2.5 gap-1 bg-muted">
          <Button type="button" variant="outline" onClick={handleCancel}>
            {t('cancel')}
          </Button>
          <Button type="submit" disabled={loadingAdd || loadingEdit}>
            {loadingAdd || loadingEdit ? t('creating') : t('create')}
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
};
