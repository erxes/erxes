import { useMemo } from 'react';
import { useMutation } from '@apollo/client';
import { ColumnDef } from '@tanstack/react-table';
import {
  IconActivity,
  IconArchive,
  IconBulb,
  IconCalendar,
  IconCategory,
  IconChartBar,
  IconCircleCheck,
  IconCircleX,
  IconPin,
  IconPinFilled,
  IconTrash,
  IconUsers,
} from '@tabler/icons-react';
import {
  Badge,
  Button,
  Command,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
  useConfirm,
} from 'erxes-ui';
import {
  MASTRA_LEARNING_PIN,
  MASTRA_LEARNING_SET_STATUS,
  MASTRA_LEARNING_REMOVE,
} from '~/graphql/mutations';
import { toastError } from '~/lib/mutationToast';
import { RowActionsMenu } from '~/components/RecordTableShared';
import { ILearningRow, confidencePct, statusVariant } from '../types';

const LearningMoreCell = ({
  learning,
  refetch,
}: {
  learning: ILearningRow;
  refetch: () => void;
}) => {
  const { confirm } = useConfirm();

  const [pin] = useMutation(MASTRA_LEARNING_PIN, {
    onCompleted: () => refetch(),
    onError: toastError(),
  });
  const [setStatus] = useMutation(MASTRA_LEARNING_SET_STATUS, {
    onCompleted: () => refetch(),
    onError: toastError(),
  });
  const [remove] = useMutation(MASTRA_LEARNING_REMOVE, {
    onCompleted: () => refetch(),
    onError: toastError(),
  });

  const handleDelete = () =>
    confirm({
      message: 'Remove this learning permanently? This cannot be undone.',
      options: { okLabel: 'Delete', cancelLabel: 'Cancel' },
    }).then(() => remove({ variables: { _id: learning._id } }));

  const statusItem = (
    next: string,
    label: string,
    Icon: typeof IconCircleCheck,
  ) =>
    learning.status === next ? null : (
      <Command.Item asChild>
        <Button
          variant="ghost"
          size="sm"
          className="justify-start w-full h-8"
          onClick={() =>
            setStatus({ variables: { _id: learning._id, status: next } })
          }
        >
          <Icon className="size-4" /> {label}
        </Button>
      </Command.Item>
    );

  return (
    <RowActionsMenu>
      <Command.Item asChild>
        <Button
          variant="ghost"
          size="sm"
          className="justify-start w-full h-8"
          onClick={() =>
            pin({
              variables: { _id: learning._id, pinned: !learning.pinned },
            })
          }
        >
          {learning.pinned ? (
            <>
              <IconPin className="size-4" /> Unpin
            </>
          ) : (
            <>
              <IconPinFilled className="size-4" /> Pin
            </>
          )}
        </Button>
      </Command.Item>
      {statusItem('approved', 'Approve', IconCircleCheck)}
      {statusItem('rejected', 'Reject', IconCircleX)}
      {statusItem('archived', 'Archive', IconArchive)}
      <Command.Item asChild>
        <Button
          variant="ghost"
          size="sm"
          className="justify-start w-full h-8 text-destructive"
          onClick={handleDelete}
        >
          <IconTrash className="size-4" /> Delete
        </Button>
      </Command.Item>
    </RowActionsMenu>
  );
};

export const useLearningColumns = ({
  setSelected,
  refetch,
}: {
  setSelected: (item: ILearningRow) => void;
  refetch: () => void;
}) =>
  useMemo<ColumnDef<ILearningRow>[]>(
    () => [
      {
        id: 'more',
        cell: ({ row }) => (
          <LearningMoreCell learning={row.original} refetch={refetch} />
        ),
        size: 33,
      },
      {
        id: 'statement',
        accessorKey: 'statement',
        header: () => (
          <RecordTable.InlineHead icon={IconBulb} label="Learning" />
        ),
        cell: ({ row }) => (
          <RecordTableInlineCell>
            <span className="flex items-center gap-1.5 min-w-0">
              {row.original.pinned ? (
                <IconPinFilled className="size-3.5 shrink-0 text-primary" />
              ) : null}
              <button
                type="button"
                onClick={() => setSelected(row.original)}
                className="text-left font-medium hover:underline line-clamp-1 cursor-pointer"
              >
                {row.original.statement || 'Untitled'}
              </button>
            </span>
          </RecordTableInlineCell>
        ),
        size: 420,
      },
      {
        id: 'type',
        accessorKey: 'type',
        header: () => (
          <RecordTable.InlineHead icon={IconCategory} label="Type" />
        ),
        cell: ({ row }) => (
          <RecordTableInlineCell>
            <Badge variant="secondary">{row.original.type}</Badge>
          </RecordTableInlineCell>
        ),
        size: 130,
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: () => (
          <RecordTable.InlineHead icon={IconActivity} label="Status" />
        ),
        cell: ({ row }) => (
          <RecordTableInlineCell>
            <Badge variant={statusVariant(row.original.status)}>
              {row.original.status}
            </Badge>
          </RecordTableInlineCell>
        ),
        size: 120,
      },
      {
        id: 'confidence',
        accessorKey: 'confidence',
        header: () => (
          <RecordTable.InlineHead icon={IconChartBar} label="Confidence" />
        ),
        cell: ({ row }) => (
          <RecordTableInlineCell>
            <span className="font-mono text-xs">
              {confidencePct(row.original.confidence)}
            </span>
          </RecordTableInlineCell>
        ),
        size: 100,
      },
      {
        id: 'sourceCount',
        accessorKey: 'sourceCount',
        header: () => (
          <RecordTable.InlineHead icon={IconUsers} label="Sources" />
        ),
        cell: ({ row }) => (
          <RecordTableInlineCell>
            <span className="text-sm">{row.original.sourceCount ?? 0}</span>
          </RecordTableInlineCell>
        ),
        size: 90,
      },
      {
        id: 'updatedAt',
        accessorKey: 'updatedAt',
        header: () => (
          <RecordTable.InlineHead icon={IconCalendar} label="Updated" />
        ),
        cell: ({ cell }) => {
          const value = cell.getValue() as string | undefined;
          return value ? (
            <RelativeDateDisplay value={value} asChild>
              <RecordTableInlineCell>
                <RelativeDateDisplay.Value value={value} />
              </RecordTableInlineCell>
            </RelativeDateDisplay>
          ) : (
            <RecordTableInlineCell>
              <span className="text-muted-foreground">—</span>
            </RecordTableInlineCell>
          );
        },
        size: 130,
      },
    ],
    [refetch, setSelected],
  );
