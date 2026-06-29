import { PrimitiveAtom } from 'jotai';
import { useAtomValue, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { Checkbox, RecordTable } from 'erxes-ui';

interface ToSyncHeaderProps<T extends { _id: string }> {
  toSyncIdsAtom: PrimitiveAtom<Record<string, boolean>>;
  isSyncable: (item: T) => boolean;
  ariaLabel: string;
}

export const ToSyncHeaderCell = <T extends { _id: string }>({
  toSyncIdsAtom,
  isSyncable,
  ariaLabel,
}: ToSyncHeaderProps<T>) => {
  const { t } = useTranslation('mongolian');
  const toSyncIds = useAtomValue(toSyncIdsAtom);
  const setToSyncIds = useSetAtom(toSyncIdsAtom);
  const { table } = RecordTable.useRecordTable();
  const syncableIds = table
    .getRowModel()
    .rows.map((row) => row.original as T)
    .filter(isSyncable)
    .map((item) => item._id);
  const selectedCount = syncableIds.filter((id) => toSyncIds[id]).length;
  const isAllSelected = syncableIds.length > 0 && selectedCount === syncableIds.length;
  const isSomeSelected = selectedCount > 0 && !isAllSelected;
  const nextChecked = !(isAllSelected || isSomeSelected);

  return (
    <div className="relative z-20 flex items-center justify-center h-8">
      <Checkbox
        key={`${syncableIds.length}-${selectedCount}`}
        checked={isAllSelected || (isSomeSelected && 'indeterminate')}
        disabled={!syncableIds.length}
        onCheckedChange={() =>
          setToSyncIds((current) => {
            const next = { ...current };
            for (const id of syncableIds) {
              if (nextChecked) next[id] = true;
              else delete next[id];
            }
            return next;
          })
        }
        aria-label={t(ariaLabel)}
      />
    </div>
  );
};

interface ToSyncCellProps<T extends { _id: string }> {
  toSyncIdsAtom: PrimitiveAtom<Record<string, boolean>>;
  isSyncable: (item: T) => boolean;
  item: T;
  ariaLabel: string;
}

export const ToSyncCell = <T extends { _id: string }>({
  toSyncIdsAtom,
  isSyncable,
  item,
  ariaLabel,
}: ToSyncCellProps<T>) => {
  const { t } = useTranslation('mongolian');
  const toSyncIds = useAtomValue(toSyncIdsAtom);
  const setToSyncIds = useSetAtom(toSyncIdsAtom);
  const disabled = !isSyncable(item);

  return (
    <div className="flex items-center justify-center">
      <Checkbox
        checked={!disabled && Boolean(toSyncIds[item._id])}
        disabled={disabled}
        onCheckedChange={(value) =>
          setToSyncIds((current) => {
            const next = { ...current };
            if (value) next[item._id] = true;
            else delete next[item._id];
            return next;
          })
        }
        aria-label={t(ariaLabel)}
      />
    </div>
  );
};
