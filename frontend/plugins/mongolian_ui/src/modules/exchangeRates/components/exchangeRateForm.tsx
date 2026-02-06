import { useState } from 'react';
import { Button, Label, DatePicker, Select } from 'erxes-ui';
import { IExchangeRate, ExchangeRateFormValues } from '../types';

type Props = {
  exchangeRate?: IExchangeRate;
  closeModal: () => void;
  currencies: string[];
};

const ExchangeRateForm = ({
  exchangeRate,
  closeModal,
  currencies,
}: Props) => {
  const [date, setDate] = useState<Date>(
    exchangeRate?.date ?? new Date(),
  );

  const [mainCurrency, setMainCurrency] = useState<string>(
    exchangeRate?.mainCurrency ?? '',
  );

  const [rateCurrency, setRateCurrency] = useState<string>(
    exchangeRate?.rateCurrency ?? '',
  );

  const [rate, setRate] = useState<number>(
    exchangeRate?.rate ?? 0,
  );

  const handleSubmit = () => {
    const doc: ExchangeRateFormValues  = {
      _id: exchangeRate?._id,
      date,
      mainCurrency,
      rateCurrency,
      rate,
    };

    console.log('exchangeRate doc:', doc);
    closeModal();
  };

  return (
    <div className="space-y-4">
      {/* Start Date */}
      <div>
        <Label>Start Date</Label>
        <DatePicker
          value={date}
          format="YYYY-MM-DD"
          onChange={(d) => d instanceof Date && setDate(d)}
        />
      </div>

      {/* Main Currency */}
      <div>
        <Label>Main Currency</Label>
        <Select value={mainCurrency} onValueChange={setMainCurrency}>
          <Select.Trigger>
            <Select.Value placeholder="Choose a main currency" />
          </Select.Trigger>
          <Select.Content>
            {currencies.map((currency) => (
              <Select.Item key={currency} value={currency}>
                {currency}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      </div>

      {/* Rate Currency */}
      <div>
        <Label>Rate Currency</Label>
        <Select value={rateCurrency} onValueChange={setRateCurrency}>
          <Select.Trigger>
            <Select.Value placeholder="Choose a rate currency" />
          </Select.Trigger>
          <Select.Content>
            {currencies.map((currency) => (
              <Select.Item key={currency} value={currency}>
                {currency}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      </div>

      {/* Rate */}
      <div>
        <Label>Rate</Label>
        <input
          type="number"
          className="h-8 w-full rounded border px-3 text-sm"
          value={rate}
          onChange={(e) => setRate(Number(e.target.value))}
        />
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="ghost" onClick={closeModal}>
          Close
        </Button>
        <Button onClick={handleSubmit}>
          Save
        </Button>
      </div>
    </div>
  );
};

export default ExchangeRateForm;
