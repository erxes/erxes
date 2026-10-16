import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Combobox,
  Form,
  Input,
  Popover,
  Select,
  Switch,
  ToggleGroup,
} from 'erxes-ui';
import { VoucherFormValues } from '../../../constants/voucherFormSchema';
import {
  DateSelectTask,
  DateSelectProvider,
  DateSelectVariant,
} from '../selects/SelectVoucherDate';
import { format } from 'date-fns';
import { IconCalendarPlus, IconCalendarTime, IconX } from '@tabler/icons-react';
import { VOUCHER_VALIDITY_UNITS } from '../../../utils/voucherTerm';

interface VoucherAddCampaignMoreFieldsProps {
  form: UseFormReturn<VoucherFormValues>;
}

const DateSelectFormField = ({
  value,
  onValueChange,
  placeholder,
}: {
  value?: Date | string;
  onValueChange?: (value?: Date) => void;
  placeholder?: string;
}) => {
  const { t } = useTranslation('loyalty');
  const [open, setOpen] = React.useState(false);

  const handleValueChange = (date?: Date) => {
    onValueChange?.(date);
    setOpen(false);
  };

  const dateValue = value ? new Date(value) : undefined;

  return (
    <DateSelectProvider
      value={dateValue}
      onValueChange={handleValueChange}
      variant={DateSelectVariant.FORM}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Popover.Trigger asChild>
            <Combobox.TriggerBase className="w-full h-8">
              {dateValue ? (
                <>
                  <IconCalendarTime className="size-4 text-muted-foreground" />
                  {format(
                    dateValue,
                    dateValue.getFullYear() === new Date().getFullYear()
                      ? 'MMM d'
                      : 'MMM d, yyyy',
                  )}
                </>
              ) : (
                <>
                  <IconCalendarPlus className="text-accent-foreground" />
                  <span className="text-accent-foreground font-medium">
                    {placeholder || t('select-date')}
                  </span>
                </>
              )}
            </Combobox.TriggerBase>
          </Popover.Trigger>
        </Form.Control>
        <Popover.Content className="w-auto p-0">
          <DateSelectTask.Content />
        </Popover.Content>
      </Popover>
    </DateSelectProvider>
  );
};

export const VoucherAddCampaignMoreFields: React.FC<
  VoucherAddCampaignMoreFieldsProps
> = ({ form }) => {
  const { t } = useTranslation('loyalty');
  const [validityMode, noEndDate] = form.watch(['validityMode', 'noEndDate']);

  return (
    <>
      <section className="flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-semibold">{t('voucher-term')}</h3>
          <p className="text-xs text-muted-foreground">
            {t('voucher-term-hint')}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Form.Label>{t('voucher-validity')}</Form.Label>
          <ToggleGroup
            type="single"
            variant="outline"
            className="w-fit"
            value={validityMode}
            onValueChange={(next) =>
              next &&
              form.setValue('validityMode', next as typeof validityMode, {
                shouldDirty: true,
              })
            }
          >
            <ToggleGroup.Item value="period" className="px-3">
              {t('voucher-validity-mode.period')}
            </ToggleGroup.Item>
            <ToggleGroup.Item value="campaign" className="px-3">
              {t('voucher-validity-mode.campaign')}
            </ToggleGroup.Item>
          </ToggleGroup>
          {validityMode === 'period' && (
            <div className="grid grid-cols-2 gap-4">
              <Form.Field
                control={form.control}
                name="validityCount"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Control>
                      <Input
                        type="number"
                        min={1}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ''
                              ? undefined
                              : Number(e.target.value),
                          )
                        }
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="validityUnit"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Control>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <Select.Trigger>
                          {t(`voucher-validity-unit.${field.value}`)}
                        </Select.Trigger>
                        <Select.Content>
                          {VOUCHER_VALIDITY_UNITS.map((unit) => (
                            <Select.Item key={unit} value={unit}>
                              {t(`voucher-validity-unit.${unit}`)}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </div>
          )}
          <Form.Description>
            {t(`voucher-validity-hint.${validityMode}`)}
          </Form.Description>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Form.Field
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('start-date')}</Form.Label>
                <div className="flex gap-1">
                  <DateSelectFormField
                    value={field.value ?? undefined}
                    onValueChange={field.onChange}
                    placeholder={t('voucher-starts-now')}
                  />
                  {field.value && (
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t('clear')}
                      onClick={() => field.onChange(null)}
                    >
                      <IconX />
                    </Button>
                  )}
                </div>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <Form.Item>
                <div className="flex items-center justify-between">
                  <Form.Label>{t('end-date')}</Form.Label>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Switch
                      checked={noEndDate}
                      onCheckedChange={(checked) =>
                        form.setValue('noEndDate', checked, {
                          shouldDirty: true,
                          shouldValidate: form.formState.isSubmitted,
                        })
                      }
                    />
                    {t('voucher-no-end-date')}
                  </label>
                </div>
                {noEndDate ? (
                  <p className="h-8 flex items-center text-sm text-muted-foreground">
                    {t('voucher-runs-until-stopped')}
                  </p>
                ) : (
                  <DateSelectFormField
                    value={field.value ?? undefined}
                    onValueChange={field.onChange}
                    placeholder={t('select-end-date')}
                  />
                )}
                <Form.Message />
              </Form.Item>
            )}
          />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-semibold">{t('voucher-buy-section')}</h3>
          <p className="text-xs text-muted-foreground">
            {t('voucher-buy-section-hint')}
          </p>
        </div>
        <Form.Field
          control={form.control}
          name="buyScore"
          render={({ field }) => (
            <Form.Item className="max-w-[calc(50%-0.5rem)]">
              <Form.Label>{t('buy-score')}</Form.Label>
              <Form.Control>
                <Input type="number" min={0} placeholder="0" {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
      </section>
    </>
  );
};
