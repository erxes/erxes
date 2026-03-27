import { ApolloError } from '@apollo/client';
import { IconTrash } from '@tabler/icons-react';
import {
  Button,
  CommandBar,
  RecordTable,
  Separator,
  Spinner,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { useRemoveItineraries } from '../hooks/useRemoveItineraries';
import { useItineraryDetail } from '../hooks/useItineraryDetail';
import { ExportPDFButton } from '../pdf';

export const ItineraryCommandBar = () => {
  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const confirmOptions = { confirmationValue: 'delete' };
  const { toast } = useToast();
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const itineraryIds = selectedRows.map((row) => row.original._id);
  const selectedCount = itineraryIds.length;
  const { removeItineraries, loading } = useRemoveItineraries();
  const singleId = selectedCount === 1 ? itineraryIds[0] : undefined;
  const { itinerary, loading: detailLoading } = useItineraryDetail(
    singleId,
    selectedCount === 1,
  );

  const onRemove = () => {
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
  };

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
            />
            <Separator.Inline />
          </>
        )}
        <Button
          variant="secondary"
          className="text-destructive"
          disabled={loading}
          onClick={onRemove}
        >
          {loading ? <Spinner /> : <IconTrash />}
          Delete
        </Button>
      </CommandBar.Bar>
    </CommandBar>
  );
};
