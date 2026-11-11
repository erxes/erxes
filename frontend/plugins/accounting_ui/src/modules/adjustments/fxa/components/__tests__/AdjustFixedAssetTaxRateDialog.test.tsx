import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import type { ControllerProps } from 'react-hook-form';
import { AdjustFixedAssetTaxRateDialog } from '@/adjustments/fxa/components/AdjustFixedAssetTaxRateDialog';

type Values = { taxRate: number };
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('erxes-ui', () => {
  const react = jest.requireActual<typeof import('react')>('react');
  const { Controller, FormProvider } =
    jest.requireActual<typeof import('react-hook-form')>('react-hook-form');
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    react.createElement('div', {}, children);
  return {
    Form: Object.assign(
      (props: React.ComponentProps<typeof FormProvider>) =>
        react.createElement(FormProvider, props),
      {
        Field: (props: ControllerProps<Values>) =>
          react.createElement(Controller<Values>, props),
        Item: wrapper,
        Label: wrapper,
        Control: wrapper,
        Message: () => null,
      },
    ),
    Input: (props: React.ComponentProps<'input'>) =>
      react.createElement('input', props),
    Button: (props: React.ComponentProps<'button'>) =>
      react.createElement('button', props),
    Spinner: () => null,
    Dialog: Object.assign(wrapper, {
      Trigger: wrapper,
      Content: wrapper,
      Header: wrapper,
      Title: wrapper,
      Description: wrapper,
      Footer: wrapper,
      Close: wrapper,
    }),
  };
});

const submit = async () => {
  const form = screen.getByRole('spinbutton').closest('form');
  if (!form) throw new Error('Tax rate form is missing');
  await act(async () => {
    fireEvent.submit(form);
  });
};

test.each(['', '-1', '101'])(
  'invalid income tax percentage %s does not start recalculation',
  async (value) => {
    const run = jest.fn();
    render(
      <AdjustFixedAssetTaxRateDialog
        disabled={false}
        loading={false}
        onRun={run}
      />,
    );
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value } });
    await submit();

    expect(run).not.toHaveBeenCalled();
  },
);

test.each([0, 10])(
  'legacy adjustment can calculate with explicit tax percentage %s',
  async (taxRate) => {
    const run = jest.fn(async () => undefined);
    render(
      <AdjustFixedAssetTaxRateDialog
        disabled={false}
        loading={false}
        onRun={run}
      />,
    );
    fireEvent.change(screen.getByRole('spinbutton'), {
      target: { value: String(taxRate) },
    });
    await submit();
    await waitFor(() => expect(run).toHaveBeenCalledWith(taxRate));
  },
);

test('existing percentage initializes the editor and can be changed for rerun', async () => {
  const run = jest.fn(async () => undefined);
  render(
    <AdjustFixedAssetTaxRateDialog
      taxRate={25}
      disabled={false}
      loading={false}
      onRun={run}
    />,
  );
  expect((screen.getByRole('spinbutton') as HTMLInputElement).value).toBe('25');
  fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '10' } });
  await submit();
  await waitFor(() => expect(run).toHaveBeenCalledWith(10));
});
