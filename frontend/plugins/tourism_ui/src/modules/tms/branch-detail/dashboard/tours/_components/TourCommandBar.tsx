import { ApolloError } from '@apollo/client';
import { IconTrash } from '@tabler/icons-react';
import { useAtomValue } from 'jotai';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
import { useRemoveTours } from '../hooks/useRemoveTours';
import { useTourDetail } from '../hooks/useTourDetail';
import { ExportTourPDFButton } from '../pdf';

interface TourCommandBarProps {
  branchId: string;
  branchLanguages?: string[];
  mainLanguage?: string;
}

export const TourCommandBar = ({
  branchId,
  branchLanguages,
  mainLanguage,
}: TourCommandBarProps) => {
  const { t } = useTranslation('tourism');
  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const confirmOptions = useMemo(() => ({ confirmationValue: 'delete' }), []);
  const { toast } = useToast();
  const activeLang = useAtomValue(activeLangAtom);
  const language = activeLang || mainLanguage;
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const tourIds = useMemo(
    () => selectedRows.map((row) => row.original._id),
    [selectedRows],
  );
  const selectedCount = tourIds.length;
  const { removeTours, loading } = useRemoveTours();
  const singleId = selectedCount === 1 ? tourIds[0] : undefined;
  const {
    tourDetail,
    loading: detailLoading,
    refetch,
  } = useTourDetail({
    variables: { id: singleId || '', language },
    skip: !singleId,
    fetchPolicy: 'cache-and-network',
  });

  const handleRemove = useCallback(() => {
    if (!selectedCount) {
      return;
    }

    confirm({
      message: t('confirm-delete-tours', { count: selectedCount }),
      options: confirmOptions,
    }).then(() => {
      removeTours({
        variables: {
          ids: tourIds,
        },
        onError: (e: ApolloError) => {
          toast({
            title: t('error'),
            description: e.message,
            variant: 'destructive',
          });
        },
        onCompleted: () => {
          table.resetRowSelection();
          toast({
            title: t('success'),
            variant: 'success',
            description: t('tours-deleted-successfully'),
          });
        },
      });
    });
  }, [
    confirm,
    confirmOptions,
    removeTours,
    selectedCount,
    table,
    toast,
    tourIds,
  ]);

  return (
    <CommandBar open={selectedCount > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>{t('x-selected', { count: selectedCount })}</CommandBar.Value>
        <Separator.Inline />
        {selectedCount === 1 && (
          <>
            <ExportTourPDFButton
              tour={tourDetail}
              loading={detailLoading}
              language={language}
              variant="secondary"
              size="sm"
              branchId={branchId}
              branchLanguages={branchLanguages}
              mainLanguage={mainLanguage}
              refetchTour={refetch}
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
          {t('delete')}
        </Button>
      </CommandBar.Bar>
    </CommandBar>
  );
};
