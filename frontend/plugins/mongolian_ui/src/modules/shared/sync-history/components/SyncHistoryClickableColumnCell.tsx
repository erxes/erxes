import { cn, RecordTableInlineCell, TextOverflowTooltip } from 'erxes-ui';
import { useSearchParams } from 'react-router';
import { ISyncHistoryFields } from './SyncHistoryDetailSheet';

export const SyncHistoryClickableColumnCell = <T extends ISyncHistoryFields>({
  row,
  value,
  isError,
}: {
  row: { original: T };
  value: string;
  isError?: boolean;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleOpen = () => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('syncHistory_id', row.original._id);
    setSearchParams(newSearchParams);
  };

  return (
    <RecordTableInlineCell
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleOpen();
        }
      }}
      className={cn(
        'cursor-pointer rounded px-2 hover:bg-muted',
        isError && value ? 'text-destructive' : 'text-muted-foreground',
      )}
    >
      <TextOverflowTooltip value={String(value || '')} />
    </RecordTableInlineCell>
  );
};
