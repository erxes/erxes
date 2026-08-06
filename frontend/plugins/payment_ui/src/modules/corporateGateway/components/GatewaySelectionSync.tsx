import { useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { RecordTable } from 'erxes-ui';
import {
  GatewayBankKey,
  gatewaySelectionAtom,
} from '~/modules/corporateGateway/states/gatewaySelection';

type Props = {
  bankKey: GatewayBankKey;
  removeConfig: (_id: string) => Promise<any>;
};

export const GatewaySelectionSync = ({ bankKey, removeConfig }: Props) => {
  const { table } = RecordTable.useRecordTable();
  const setSelection = useSetAtom(gatewaySelectionAtom);

  const selectedIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original._id);
  const idsKey = selectedIds.join(',');

  useEffect(() => {
    setSelection((prev) => ({
      ...prev,
      [bankKey]: {
        ids: selectedIds,
        removeConfig,
        resetSelection: () => table.resetRowSelection(),
      },
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bankKey, idsKey, removeConfig]);

  useEffect(() => {
    return () => {
      setSelection((prev) => {
        const { [bankKey]: _removed, ...rest } = prev;
        return rest;
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bankKey]);

  return null;
};

export default GatewaySelectionSync;
