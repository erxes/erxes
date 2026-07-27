import { ApolloError } from '@apollo/client';
import { IconTrash } from '@tabler/icons-react';
import { Button, useConfirm, useToast } from 'erxes-ui';
import { Can, ISegment } from 'ui-modules';
import { Row } from '@tanstack/table-core';
import { useRemoveSegments } from '../hooks/useRemoveSegments';
import { useTranslation } from 'react-i18next';

export const SegmentRemoveButtonCommandBar = ({
  segmentIds,
  rows,
}: {
  segmentIds: string[];
  rows: Row<ISegment>[];
}) => {
  const { t } = useTranslation('segment');
  const { confirm } = useConfirm();
  const { removeSegments } = useRemoveSegments();
  const { toast } = useToast();
  return (
    <Can action="segmentsManage">
      <Button
        variant="secondary"
        className="text-destructive"
        onClick={() =>
          confirm({
            message: `Are you sure you want to delete the ${segmentIds.length} selected segments?`,
          }).then(() => {
            removeSegments(segmentIds, {
              onError: (e: ApolloError) => {
                toast({
                  title: t('error', 'Error'),
                  description: e.message,
                  variant: 'destructive',
                });
              },
              onCompleted: () => {
                rows.forEach((row) => {
                  row.toggleSelected(false);
                });
                toast({
                  title: t('success', 'Success'),
                  variant: 'success',
                  description: t('segments-deleted', 'Segments deleted successfully'),
                });
              },
            });
          })
        }
      >
        <IconTrash />
        {t('delete', 'Delete')}
      </Button>
    </Can>
  );
};
