import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { putResponseColumns } from '~/modules/ebarimt/put-response/components/PutResponseColumn';
import { IPutResponse } from '~/modules/ebarimt/put-response/types/PutResponseType';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => `t:${key}` }),
}));
jest.mock('erxes-ui', () => ({
  REACT_APP_API_URL: 'https://erxes.test',
  Badge: ({ children, variant }: { children: ReactNode; variant: string }) => (
    <span data-variant={variant}>{children}</span>
  ),
  RecordTableInlineCell: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  TextOverflowTooltip: ({ value }: { value: string }) => <span>{value}</span>,
  RecordTable: { ColumnSelector: () => null },
}));
jest.mock('ui-modules', () => ({
  MembersInline: ({ memberIds }: { memberIds: string[] }) => (
    <span>member:{memberIds.join(',')}</span>
  ),
}));

const putResponse = (overrides: Partial<IPutResponse>) =>
  ({
    _id: 'pr-0357',
    id: '112502020902001012345678901234567',
    status: 'SUCCESS',
    state: null,
    userId: 'user-bold',
    ...overrides,
  }) as IPutResponse;

const renderCell = (columnId: string, row: IPutResponse) => {
  const column = putResponseColumns('Asia/Ulaanbaatar').find(
    (col) => col.id === columnId,
  );
  const Cell = column?.cell as (props: {
    row: { original: IPutResponse };
  }) => ReactNode;

  return render(<>{Cell({ row: { original: row } })}</>);
};

describe('put response status column', () => {
  it('shows a sent receipt as a green success badge', () => {
    renderCell('status', putResponse({}));

    expect(screen.getByText('t:success').dataset.variant).toBe('success');
  });

  it('shows a rejected send as a red error badge', () => {
    renderCell(
      'status',
      putResponse({ id: '', status: 'ERROR', message: 'ТТД буруу' }),
    );

    expect(screen.getByText('t:error').dataset.variant).toBe('destructive');
  });

  it('shows a returned or replaced receipt as inactive', () => {
    renderCell('status', putResponse({ state: 'inactive' }));

    expect(screen.getByText('t:inactive').dataset.variant).toBe('secondary');
  });
});

describe('put response user column', () => {
  it('shows the team member who sent the receipt', () => {
    renderCell('user', putResponse({}));

    expect(screen.getByText('member:user-bold')).toBeTruthy();
  });

  it('shows a dash when the receipt was sent by automation', () => {
    renderCell('user', putResponse({ userId: null }));

    expect(screen.getByText('-')).toBeTruthy();
    expect(screen.queryByText(/member:/)).toBeNull();
  });
});
