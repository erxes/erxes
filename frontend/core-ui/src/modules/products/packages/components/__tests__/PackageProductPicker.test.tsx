/** @jest-environment jsdom */
import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps, ReactNode } from 'react';
import { GET_PACKAGE_CHOSEN_PRODUCTS } from '../../graphql/packageQueries';
import { PackageProductPicker } from '../PackageProductPicker';

// Factories run before this file's own declarations, so each draws its own.
jest.mock('erxes-ui', () => {
  const Pass = ({ children }: { children?: ReactNode }) => <>{children}</>;
  return {
    Button: ({ children, ...props }: ComponentProps<'button'>) => (
      <button {...props}>{children}</button>
    ),
    Skeleton: () => <div data-testid="skeleton" />,
    Popover: Object.assign(Pass, { Trigger: Pass }),
    Combobox: { Content: () => null },
  };
});
// The product search is not under test.
jest.mock('ui-modules', () => {
  const Pass = ({ children }: { children?: ReactNode }) => <>{children}</>;
  return { SelectProduct: { Provider: Pass, Content: () => null } };
});
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string | { defaultValue?: string }) =>
      typeof fallback === 'string' ? fallback : fallback?.defaultValue ?? key,
  }),
}));

const VALUE = [{ productId: 'p1', quantity: 2 }];
const request = {
  query: GET_PACKAGE_CHOSEN_PRODUCTS,
  variables: { ids: ['p1'] },
};
const COFFEE = {
  __typename: 'Product',
  _id: 'p1',
  name: 'Coffee',
  code: 'C-1',
  unitPrice: 5,
};

describe('PackageProductPicker', () => {
  it('shows a failed load with Retry in place of the lines, then the products', async () => {
    render(
      <MockedProvider
        mocks={[
          { request, error: new Error('Network down') },
          { request, result: { data: { products: [COFFEE] } } },
        ]}
      >
        <PackageProductPicker value={VALUE} onChange={jest.fn()} />
      </MockedProvider>,
    );

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('Could not load the products');
    expect(alert.textContent).toContain('Network down');
    // Nothing claims the product is gone.
    expect(screen.queryByText('Unavailable product')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByText('Coffee')).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
