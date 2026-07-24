jest.mock('erxes-ui', () => ({
  ...jest.requireActual(
    '../../../../../libs/erxes-ui/src/components/loading-context',
  ),
  ...jest.requireActual(
    '../../../../../libs/erxes-ui/src/components/spinner',
  ),
  ...jest.requireActual(
    '../../../../../libs/erxes-ui/src/components/skeleton',
  ),
}));

import { PageLoadingProvider } from '@/navigation/components/PageLoadingProvider';
import { pageLoadingPathnamesState } from '@/navigation/states/pageLoadingState';
import { Skeleton, Spinner } from 'erxes-ui';
import { Provider, useAtomValue } from 'jotai';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const PageLoadingPathnamesProbe = () => {
  const loadingPathnames = useAtomValue(pageLoadingPathnamesState);

  return (
    <output data-testid="loading-pathnames">
      {JSON.stringify([...loadingPathnames])}
    </output>
  );
};

type LoadingIndicator = 'skeleton' | 'spinner' | null;

const PageLoadingTestTree = ({
  loadingIndicator,
}: {
  loadingIndicator: LoadingIndicator;
}) => (
  <Provider>
    <MemoryRouter initialEntries={['/sales/deals/']}>
      <PageLoadingProvider>
        {loadingIndicator === 'spinner' && <Spinner />}
        {loadingIndicator === 'skeleton' && <Skeleton />}
      </PageLoadingProvider>
      <PageLoadingPathnamesProbe />
    </MemoryRouter>
  </Provider>
);

describe('PageLoadingProvider', () => {
  it('tracks a visible page spinner against the normalized pathname', async () => {
    const { rerender } = render(
      <PageLoadingTestTree loadingIndicator="spinner" />,
    );

    await waitFor(() =>
      expect(screen.getByTestId('loading-pathnames').textContent).toBe(
        JSON.stringify(['/sales/deals']),
      ),
    );

    rerender(<PageLoadingTestTree loadingIndicator={null} />);

    await waitFor(() =>
      expect(screen.getByTestId('loading-pathnames').textContent).toBe(
        JSON.stringify([]),
      ),
    );
  });

  it('ignores persistent pagination skeletons', async () => {
    render(<PageLoadingTestTree loadingIndicator="skeleton" />);

    await waitFor(() =>
      expect(screen.getByTestId('loading-pathnames').textContent).toBe(
        JSON.stringify([]),
      ),
    );
  });
});
