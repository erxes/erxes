import { Meta, StoryObj } from '@storybook/react';
import { CurrencyDisplay, CurrencyFormatedDisplay } from 'erxes-ui/modules';
import { CurrencyCode } from 'erxes-ui/types';

const meta: Meta<typeof CurrencyDisplay> = {
  title: 'Modules/Display/Currency',
  component: CurrencyDisplay,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof CurrencyDisplay>;

export const Default: Story = {
  args: {
    code: CurrencyCode.USD,
    variant: 'icon',
  },
};

export const WithLabel: Story = {
  args: {
    code: CurrencyCode.EUR,
    variant: 'label',
  },
};

export const WithCode: Story = {
  args: {
    code: CurrencyCode.GBP,
    variant: 'code',
  },
};

export const FormattedCurrency: StoryObj<typeof CurrencyFormatedDisplay> = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Currency with amount</h3>
        <CurrencyFormatedDisplay
          currencyValue={{
            amountMicros: 1250000000,
            currencyCode: CurrencyCode.USD,
          }}
        />
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium">Zero amount</h3>
        <CurrencyFormatedDisplay
          currencyValue={{
            amountMicros: 0,
            currencyCode: CurrencyCode.EUR,
          }}
        />
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium">No currency code</h3>
        <CurrencyFormatedDisplay
          currencyValue={{
            currencyCode: CurrencyCode.USD,
            amountMicros: 5000000,
          }}
        />
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium">Null value</h3>
        <CurrencyFormatedDisplay currencyValue={null} />
      </div>
    </div>
  ),
};
