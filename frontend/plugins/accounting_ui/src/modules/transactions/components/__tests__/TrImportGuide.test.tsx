import { render, screen, within } from '@testing-library/react';
import { TrImportGuideDialog } from '@/transactions/components/TrImportGuide';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@tabler/icons-react', () => {
  const mockIcon = () => null;
  return new Proxy({ __esModule: true }, { get: () => mockIcon });
});

jest.mock('erxes-ui', () => ({
  Button: 'button',
  Separator: 'hr',
  ScrollArea: 'div',
  Dialog: Object.assign(
    ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    {
      Trigger: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
      ),
      ContentCombined: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
      ),
    },
  ),
}));

describe('transaction import guide', () => {
  test('numbers a sales return file columns in the order the import reads them', () => {
    render(<TrImportGuideDialog />);

    const card = screen.getByText('sales-return-label-2')
      .parentElement as HTMLElement;
    const rows = within(card).getAllByRole('listitem');

    expect(rows.map((row) => row.textContent)).toEqual([
      'CF1return-voucher-number',
      'CF2finished-goods-account',
      'CF3cost-of-goods-sold-account',
    ]);
  });

  test('generated journals are not offered as import values', () => {
    render(<TrImportGuideDialog />);

    expect(screen.queryByText('invSaleOut')).toBeNull();
  });
});
