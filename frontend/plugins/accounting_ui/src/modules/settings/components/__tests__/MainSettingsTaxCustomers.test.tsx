import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ComponentProps, ReactNode } from 'react';
import { CustomerType } from 'ui-modules';
import { useMainConfigs } from '../../hooks/useMainConfigs';
import { useMainUpdateConfigs } from '../../hooks/useMainUpdateConfigs';
import { MainSettingsForm } from '../MainSettingsForm';

jest.mock('erxes-ui', () => {
  const { Controller } =
    jest.requireActual<typeof import('react-hook-form')>('react-hook-form');
  const Pass = ({ children }: { children: ReactNode }) => children;

  return {
    Button: (props: ComponentProps<'button'>) => <button {...props} />,
    Checkbox: () => null,
    Collapsible: Object.assign(Pass, {
      Content: Pass,
      TriggerButton: Pass,
      TriggerIcon: () => null,
    }),
    Form: Object.assign(Pass, {
      Field: Controller,
      Item: Pass,
      Label: Pass,
      Control: Pass,
      Message: () => null,
    }),
    Select: Object.assign(
      ({
        value,
        onValueChange,
        children,
      }: {
        value: string;
        onValueChange: (value: string) => void;
        children: ReactNode;
      }) => (
        <select
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
        >
          {children}
        </select>
      ),
      {
        Content: Pass,
        Trigger: () => null,
        Value: () => null,
        Item: (props: ComponentProps<'option'>) => <option {...props} />,
      },
    ),
  };
});

jest.mock('ui-modules', () => {
  const Picker = ({
    mode,
    value,
    onValueChange,
  }: {
    mode: 'single' | 'multiple';
    value: string;
    onValueChange: (value: string) => void;
  }) =>
    mode === 'single' ? (
      <input
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
      />
    ) : null;

  return {
    CustomerType: { CUSTOMER: 'customer', COMPANY: 'company', USER: 'user' },
    SelectCompany: Picker,
    SelectCustomer: { FormItem: Picker },
    SelectMember: { FormItem: Picker },
  };
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('@/settings/account/components/SelectAccount', () => ({
  SelectAccount: () => null,
}));
jest.mock('../../hooks/useMainConfigs', () => ({ useMainConfigs: jest.fn() }));
jest.mock('../../hooks/useMainUpdateConfigs', () => ({
  useMainUpdateConfigs: jest.fn(),
}));

const updateConfigs = jest.fn();

beforeEach(() => {
  updateConfigs.mockClear();
  jest.mocked(useMainUpdateConfigs).mockReturnValue({
    updateConfigs,
    loading: false,
  });
});

it('restores independent tax contacts and saves a replacement and a cleared pair', async () => {
  jest.mocked(useMainConfigs).mockReturnValue({
    configs: {
      HasVat: true,
      HasCtax: true,
      VatCustomer: {
        customerType: CustomerType.COMPANY,
        customerId: 'vat-company',
      },
      CtaxCustomer: {
        customerType: CustomerType.USER,
        customerId: 'city-user',
      },
    },
    loading: false,
    error: undefined,
  });
  render(<MainSettingsForm />);

  expect(screen.getByDisplayValue('vat-company')).toBeTruthy();
  expect(screen.getByDisplayValue('city-user')).toBeTruthy();

  fireEvent.change(screen.getAllByRole('combobox')[0], {
    target: { value: 'customer' },
  });
  expect(screen.queryByDisplayValue('vat-company')).toBeNull();
  fireEvent.change(screen.getAllByRole('textbox')[0], {
    target: { value: 'vat-customer' },
  });
  fireEvent.click(screen.getAllByRole('button', { name: 'clear' })[1]);
  fireEvent.click(screen.getByRole('button', { name: 'save' }));

  await waitFor(() =>
    expect(updateConfigs).toHaveBeenCalledWith(
      expect.objectContaining({
        VatCustomer: { customerType: 'customer', customerId: 'vat-customer' },
        CtaxCustomer: null,
      }),
    ),
  );
});

it('can save enabled legacy tax settings without a configured contact', async () => {
  jest.mocked(useMainConfigs).mockReturnValue({
    configs: { HasVat: true, HasCtax: true },
    loading: false,
    error: undefined,
  });
  render(<MainSettingsForm />);
  fireEvent.click(screen.getByRole('button', { name: 'save' }));

  await waitFor(() =>
    expect(updateConfigs).toHaveBeenCalledWith(
      expect.objectContaining({ VatCustomer: null, CtaxCustomer: null }),
    ),
  );
});
