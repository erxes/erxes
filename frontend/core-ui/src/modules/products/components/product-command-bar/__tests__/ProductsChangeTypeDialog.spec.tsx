import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ProductsChangeTypeDialog } from '../ProductsChangeTypeDialog';

jest.mock('erxes-ui', () => {
  const { Controller, FormProvider } =
    jest.requireActual<typeof import('react-hook-form')>('react-hook-form');
  const Container = ({ children }: { children?: ReactNode }) => children;
  const Empty = () => null;
  return {
    Button: 'button',
    Input: 'input',
    Spinner: Empty,
    Dialog: Object.assign(Container, {
      Content: Container,
      Header: Container,
      Title: Container,
      Description: Container,
      Footer: Container,
    }),
    Form: Object.assign(FormProvider, {
      Field: Controller,
      Item: Container,
      Label: Container,
      Control: Container,
      Message: Empty,
    }),
    Select: Object.assign(Container, {
      Trigger: Container,
      Value: Empty,
      Content: Container,
      Item: Container,
    }),
  };
});
jest.mock('ui-modules', () => ({ SelectProductType: () => null }));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (_key: string, fallback: string) => fallback }),
}));

describe('product type refresh recovery', () => {
  it('retries a pending refresh without requiring the reopened form to be filled', async () => {
    const apply = jest.fn().mockResolvedValue(true);
    const onOpenChange = jest.fn();
    render(
      <ProductsChangeTypeDialog
        products={[{ _id: 'saved', status: 'active' }]}
        changeType={{ apply, saving: false, refreshPending: true }}
        open
        onOpenChange={onOpenChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Retry refresh' }));

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(apply).toHaveBeenCalledTimes(1);
    expect(apply).toHaveBeenCalledWith();
  });
});
