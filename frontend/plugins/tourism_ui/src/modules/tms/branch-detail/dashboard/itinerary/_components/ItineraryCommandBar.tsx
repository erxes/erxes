import { ApolloError } from '@apollo/client';
import { IconTrash } from '@tabler/icons-react';
import { useAtomValue } from 'jotai';
import { useCallback, useMemo } from 'react';
import {
  Button,
  CommandBar,
  RecordTable,
  Separator,
  Spinner,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { activeLangAtom } from '@/tms/atoms/activeLangAtom';
import { useRemoveItineraries } from '../hooks/useRemoveItineraries';
import { useItineraryDetail } from '../hooks/useItineraryDetail';
import { ExportPDFButton } from '../pdf';

interface ItineraryCommandBarProps {
  branchId: string;
  branchLanguages?: string[];
  mainLanguage?: string;
}

export const ItineraryCommandBar = ({
  branchId,
  branchLanguages,
  mainLanguage,
}: ItineraryCommandBarProps) => {
  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const confirmOptions = useMemo(() => ({ confirmationValue: 'delete' }), []);
  const { toast } = useToast();
  const activeLang = useAtomValue(activeLangAtom);
  const language = activeLang || mainLanguage;
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const itineraryIds = useMemo(
    () => selectedRows.map((row) => row.original._id),
    [selectedRows],
  );
  const selectedCount = itineraryIds.length;
  const { removeItineraries, loading } = useRemoveItineraries();
  const singleId = selectedCount === 1 ? itineraryIds[0] : undefined;
  const {
    itinerary,
    loading: detailLoading,
    refetch,
  } = useItineraryDetail(singleId, selectedCount === 1, language);

  const handleRemove = useCallback(() => {
    if (!selectedCount) {
      return;
    }

    confirm({
      message: `Are you sure you want to delete the ${selectedCount} selected itineraries?`,
      options: confirmOptions,
    }).then(() => {
      removeItineraries(itineraryIds)
        .then(() => {
          table.resetRowSelection();
          toast({
            title: 'Success',
            variant: 'success',
            description: 'Itineraries deleted successfully',
          });
        })
        .catch((e: ApolloError) => {
          toast({
            title: 'Error',
            description: e.message,
            variant: 'destructive',
          });
        });
    });
  }, [
    confirm,
    confirmOptions,
    itineraryIds,
    removeItineraries,
    selectedCount,
    table,
    toast,
  ]);

  return (
    <CommandBar open={selectedCount > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>{selectedCount} selected</CommandBar.Value>
        <Separator.Inline />
        {selectedCount === 1 && (
          <>
            <ExportPDFButton
              itinerary={itinerary}
              loading={detailLoading}
              variant="secondary"
              size="sm"
              branchId={branchId}
              branchLanguages={branchLanguages}
              mainLanguage={mainLanguage}
              refetchItinerary={refetch}
            />
            <Separator.Inline />
          </>
        )}
        <Button
          variant="secondary"
          className="text-destructive"
          disabled={loading}
          onClick={handleRemove}
        >
          {loading ? <Spinner /> : <IconTrash />}
          Delete
        </Button>
      </CommandBar.Bar>
    </CommandBar>
  );
};
