import type { ExchangeRate } from '@erxes/core-contract';
import { zodResolver } from '@hookform/resolvers/zod';
import { DatePicker, Form, Input, Select, toIsoDay } from 'erxes-ui';
import { useState } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { FormSheet } from '~/components/FormSheet';
import { useSession } from '~/modules/auth/session';
import { useSaveExchangeRate } from './useExchangeRates';

type Translate = (key: string, defaultValue: string) => string;

/** 3.x's form: a start date, both currencies and a rate above 0. */
const rateSchema = (t: Translate) =>
  z.object({
    date: z.string().min(1, t('date-required', 'Date is required')),
    mainCurrency: z.string().min(1, t('main-currency-required', 'Main currency is required')),
    rateCurrency: z.string().min(1, t('rate-currency-required', 'Rate currency is required')),
    rate: z.number().positive(t('rate-positive', 'Rate must be greater than 0')),
  });

type RateValues = z.infer<ReturnType<typeof rateSchema>>;

/** The currencies the organisation trades in: its own first, then the others (3.x's deal currencies). */
const useCurrencies = () => {
  const { organization } = useSession();

  return [...new Set([organization.currency, ...organization.currencies])];
};

const CurrencyField = ({
  name,
  label,
  placeholder,
}: {
  name: 'mainCurrency' | 'rateCurrency';
  label: string;
  placeholder: string;
}) => {
  const { control } = useFormContext<RateValues>();
  const currencies = useCurrencies();

  return (
    <Form.Field
      control={control}
      name={name}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{label}</Form.Label>
          <Select value={field.value} onValueChange={(value) => field.onChange(value ?? '')}>
            <Form.Control>
              <Select.Trigger>
                <Select.Value placeholder={placeholder} />
              </Select.Trigger>
            </Form.Control>
            <Select.Content>
              {currencies.map((currency) => (
                <Select.Item key={currency} value={currency}>
                  {currency}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};

const RateFields = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'exchange-rates' });
  const { control } = useFormContext<RateValues>();

  return (
    <>
      <Form.Field
        control={control}
        name="date"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('start-date', 'Start Date')}</Form.Label>
            <Form.Control>
              <DatePicker
                value={field.value || undefined}
                placeholder="YYYY-MM-DD"
                onChange={(date) => date instanceof Date && field.onChange(toIsoDay(date))}
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <div className="grid grid-cols-2 gap-4">
        <CurrencyField
          name="mainCurrency"
          label={t('main-currency', 'Main Currency')}
          placeholder={t('choose-main-currency', 'Choose a main currency')}
        />
        <CurrencyField
          name="rateCurrency"
          label={t('rate-currency', 'Rate Currency')}
          placeholder={t('choose-rate-currency', 'Choose a rate currency')}
        />
      </div>
      <Form.Field
        control={control}
        name="rate"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('rate', 'Rate')}</Form.Label>
            <Form.Control>
              <Input.Number
                value={field.value}
                onChange={(value) => field.onChange(Number(value) || 0)}
                placeholder="0.00"
                scale={8}
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
    </>
  );
};

/**
 * Adds a rate, or edits `rate`: 3.x's sheet with the start date, the main and rate currencies
 * (the organisation's own preselected) and the rate.
 */
export const ExchangeRateSheet = ({
  rate,
  open,
  onOpenChange,
}: {
  rate: ExchangeRate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'exchange-rates' });
  const { organization } = useSession();
  const { create, update, saving } = useSaveExchangeRate();

  // The page mounts a new sheet each time it opens, so a new rate starts today.
  const [today] = useState(() => toIsoDay(new Date()));

  const form = useForm<RateValues>({
    resolver: zodResolver(rateSchema(t)),
    defaultValues: rate
      ? {
          date: rate.date,
          mainCurrency: rate.mainCurrency,
          rateCurrency: rate.rateCurrency,
          rate: rate.rate,
        }
      : { date: today, mainCurrency: organization.currency, rateCurrency: '', rate: 0 },
  });

  const close = () => onOpenChange(false);

  const save = (values: RateValues) => {
    if (rate) {
      update.mutate({ id: rate.id, ...values }, { onSuccess: close });
    } else {
      create.mutate(values, { onSuccess: close });
    }
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={
        rate
          ? t('edit-exchange-rate', 'Edit Exchange Rate')
          : t('add-exchange-rate', 'Add Exchange Rate')
      }
      onSubmit={(event) => void form.handleSubmit(save)(event)}
      submitting={saving}
    >
      <Form {...form}>
        <RateFields />
      </Form>
    </FormSheet>
  );
};
