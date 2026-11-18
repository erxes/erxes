import {
  Button,
  DatePicker,
  Form,
  Input,
  Select,
  Sheet,
  Spinner,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useCurrencyRateCurrencies } from '../hooks/useCurrencyRateCurrencies';
import { useCurrencyRateForm } from '../hooks/useCurrencyRateForm';

const FORM_ID = 'currency-rate-form';

export const CurrencyRateSheet = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'currency-rates' });
  const { form, open, editing, loading, onSubmit, close } =
    useCurrencyRateForm();
  const { mainCurrency, rateCurrencies } = useCurrencyRateCurrencies();
  const rateCurrency = form.watch('rateCurrency');

  return (
    <Sheet open={open} onOpenChange={(value) => !value && close()}>
      <Sheet.View className="bg-background sm:max-w-md">
        <Sheet.Header>
          <Sheet.Title>
            {editing
              ? t('edit-rate', 'Edit exchange rate')
              : t('add-rate', 'Add rate')}
          </Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {!mainCurrency ? (
            <p className="text-sm text-muted-foreground">
              {t(
                'no-main-currency',
                'Set the main currency in General settings before adding rates.',
              )}
            </p>
          ) : (
            <Form {...form}>
              <form id={FORM_ID} onSubmit={onSubmit} className="space-y-5">
                <Form.Field
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>{t('date', 'Date')}</Form.Label>
                      <Form.Control>
                        <DatePicker
                          value={field.value}
                          onChange={(date) =>
                            date instanceof Date && field.onChange(date)
                          }
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  control={form.control}
                  name="rateCurrency"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>{t('currency', 'Currency')}</Form.Label>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <Form.Control>
                          <Select.Trigger>
                            <Select.Value
                              placeholder={t(
                                'choose-currency',
                                'Choose a currency',
                              )}
                            />
                          </Select.Trigger>
                        </Form.Control>
                        <Select.Content>
                          {rateCurrencies.map((currency) => (
                            <Select.Item key={currency} value={currency}>
                              {currency}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                      {rateCurrencies.length === 0 && (
                        <Form.Description>
                          {t(
                            'no-currencies',
                            'Add currencies to "Deal currency" in General settings first.',
                          )}
                        </Form.Description>
                      )}
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  control={form.control}
                  name="rate"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>
                        {t('rate-label', {
                          rateCurrency: rateCurrency || '1',
                          mainCurrency,
                          defaultValue:
                            '1 {{rateCurrency}} = ? {{mainCurrency}}',
                        })}
                      </Form.Label>
                      <Form.Control>
                        <Input.Number
                          value={field.value}
                          scale={4}
                          placeholder="0.00"
                          onChange={(value) =>
                            field.onChange(value === '' ? undefined : value)
                          }
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              </form>
            </Form>
          )}
        </div>
        <Sheet.Footer className="gap-2 border-t bg-background">
          <Button variant="outline" size="lg" onClick={close}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            size="lg"
            disabled={loading || !mainCurrency}
          >
            {loading ? <Spinner /> : t('save', 'Save')}
          </Button>
        </Sheet.Footer>
      </Sheet.View>
    </Sheet>
  );
};
