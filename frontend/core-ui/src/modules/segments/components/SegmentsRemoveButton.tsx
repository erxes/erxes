import { ApolloError } from '@apollo/client';
import { IconTrash } from '@tabler/icons-react';
import { Button, useConfirm, useToast } from 'erxes-ui';
import { Can, ISegment } from 'ui-modules';
import { Row } from '@tanstack/table-core';
import { useTranslation } from 'react-i18next';
import { useRemoveSegments } from '../hooks/useRemoveSegments';

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
            message: t('delete-selected-confirm', {
              total: segmentIds.length,
            }),
          }).then(() => {
            removeSegments(segmentIds, {
              onError: (e: ApolloError) => {
                toast({
                  title: t('error'),
                  description: e.message,
                  variant: 'destructive',
                });
              },
              onCompleted: () => {
                rows.forEach((row) => {
                  row.toggleSelected(false);
                });
                toast({
                  title: t('success'),
                  variant: 'success',
                  description: t('segments-deleted'),
                });
              },
            });
          })
        }
      >
        <IconTrash />
        {t('delete')}
      </Button>
    </Can>
  );
};
