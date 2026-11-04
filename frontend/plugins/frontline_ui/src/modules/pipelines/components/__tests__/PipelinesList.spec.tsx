import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { IPipeline } from '@/pipelines/types';
import { PipelinesList } from '../PipelinesList';

interface RemovalResult {
  data?: { removePipeline: unknown };
  errors?: unknown[];
}
const mockRemovePipeline = jest.fn<
  Promise<RemovalResult>,
  [{ variables: { id: string } }]
>();
const mockConfirm = jest.fn<Promise<void>, [unknown]>();
let mockActiveRecord: { contentType: string; contentId: string } | null;

jest.mock('erxes-ui', () => {
  const { flexRender, getCoreRowModel, useReactTable } = jest.requireActual<
    typeof import('@tanstack/react-table')
  >('@tanstack/react-table');
  const Container = ({ children }: PropsWithChildren) => <div>{children}</div>;
  const Provider = ({
    columns,
    data,
  }: {
    columns: ColumnDef<IPipeline>[];
    data: IPipeline[];
  }) => {
    const table = useReactTable({
      columns,
      data,
      getCoreRowModel: getCoreRowModel(),
    });
    const cell = table
      .getRowModel()
      .rows[0]?.getVisibleCells()
      .find((entry) => entry.column.id === 'more');
    return (
      <div>
        {cell && flexRender(cell.column.columnDef.cell, cell.getContext())}
      </div>
    );
  };
  return {
    RecordTable: Object.assign(Container, {
      Provider,
      Header: Container,
      Body: Container,
      RowList: Container,
      MoreButton: () => <button>More</button>,
    }),
    Popover: Object.assign(Container, { Trigger: Container }),
    Combobox: { Content: Container },
    Command: Object.assign(Container, {
      List: Container,
      Item: ({
        children,
        onSelect,
        disabled,
      }: PropsWithChildren<{
        onSelect?: () => undefined | Promise<void>;
        disabled?: boolean;
      }>) => (
        <button
          disabled={disabled}
          onClick={() => {
            onSelect?.();
          }}
        >
          {children}
        </button>
      ),
    }),
    Spinner: () => null,
    useConfirm: () => ({ confirm: mockConfirm }),
  };
});
jest.mock('ui-modules', () => ({
  useSidePanel: () => ({
    record: mockActiveRecord,
    close: () => {
      mockActiveRecord = null;
    },
    openRecord: jest.fn(),
  }),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback ?? key,
  }),
}));
jest.mock('@/pipelines/hooks/useGetPipelines', () => ({
  useGetPipelines: () => ({
    pipelines: [
      { _id: 'pipeline-1', channelId: 'channel-1', name: 'Pipeline' },
    ],
    loading: false,
  }),
}));
jest.mock('@/pipelines/hooks/usePipelineRemove', () => ({
  usePipelineRemove: () => ({
    removePipeline: mockRemovePipeline,
    loading: false,
  }),
}));
jest.mock('@/channels/components/move-resources/MoveToChannelDialog', () => ({
  MoveToChannelDialog: () => null,
}));

beforeEach(() => {
  mockActiveRecord = {
    contentType: 'frontline:pipeline',
    contentId: 'pipeline-1~properties',
  };
  mockConfirm.mockReset().mockReturnValue(Promise.resolve());
  mockRemovePipeline
    .mockReset()
    .mockResolvedValue({ data: { removePipeline: { ok: 1 } } });
});

test('a dismissed confirmation leaves the pipeline open and allows a later confirmed delete', async () => {
  mockConfirm.mockImplementationOnce(() => new Promise<void>(() => undefined));
  render(<PipelinesList channelId="channel-1" />);
  fireEvent.click(screen.getByText('Delete'));
  expect(mockRemovePipeline).not.toHaveBeenCalled();

  fireEvent.click(screen.getByText('Delete'));

  await waitFor(() => expect(mockActiveRecord).toBeNull());
  expect(mockRemovePipeline).toHaveBeenCalledTimes(1);
});

test('a resolved mutation error keeps the pipeline open', async () => {
  mockRemovePipeline.mockResolvedValue({ errors: [{ message: 'Denied' }] });
  render(<PipelinesList channelId="channel-1" />);

  await act(() => Promise.resolve(fireEvent.click(screen.getByText('Delete'))));

  expect(mockRemovePipeline).toHaveBeenCalled();
  expect(mockActiveRecord).toEqual({
    contentType: 'frontline:pipeline',
    contentId: 'pipeline-1~properties',
  });
});

test('a rejected delete keeps the pipeline open', async () => {
  mockRemovePipeline.mockRejectedValue(new Error('Offline'));
  render(<PipelinesList channelId="channel-1" />);

  await act(() => Promise.resolve(fireEvent.click(screen.getByText('Delete'))));

  expect(mockActiveRecord).toEqual({
    contentType: 'frontline:pipeline',
    contentId: 'pipeline-1~properties',
  });
});

test.each([false, true])(
  'a pending delete preserves a new panel when unmounted=%s',
  async (unmountBeforeResult) => {
    let resolveRemoval: ((result: RemovalResult) => void) | undefined;
    mockRemovePipeline.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRemoval = resolve;
        }),
    );
    const view = render(<PipelinesList channelId="channel-1" />);
    fireEvent.click(screen.getByText('Delete'));
    await waitFor(() => expect(mockRemovePipeline).toHaveBeenCalled());
    if (unmountBeforeResult) view.unmount();
    mockActiveRecord = {
      contentType: 'frontline:ticket',
      contentId: 'newly-active',
    };
    if (!unmountBeforeResult)
      view.rerender(<PipelinesList channelId="channel-1" />);

    await act(() =>
      Promise.resolve(
        resolveRemoval?.({ data: { removePipeline: { ok: 1 } } }),
      ),
    );

    expect(mockActiveRecord).toEqual({
      contentType: 'frontline:ticket',
      contentId: 'newly-active',
    });
  },
);
