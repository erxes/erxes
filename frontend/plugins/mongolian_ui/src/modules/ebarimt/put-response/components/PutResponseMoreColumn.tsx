import { IconPrinter } from '@tabler/icons-react';
import { Cell } from '@tanstack/react-table';
import { Button, Popover, RecordTable, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { IPutResponse } from '~/modules/ebarimt/put-response/types/PutResponseType';
import {
  isPrintablePutResponse,
  toPrintResponse,
} from '~/modules/ebarimt/put-response/utils/putResponsePrint';
import { printEbarimtResponses } from '~/modules/ebarimt/responded/utils/printEbarimtResponses';

export const PutResponseMoreColumnCell = ({
  cell,
  timeZone,
}: {
  cell: Cell<IPutResponse, unknown>;
  timeZone: string;
}) => {
  const { t } = useTranslation('mongolian');
  const { toast } = useToast();
  const row = cell.row.original;

  const handlePrint = () => {
    if (!printEbarimtResponses([toPrintResponse(row, timeZone)])) {
      toast({
        title: t('error'),
        description: t('allow-popups-to-print'),
        variant: 'destructive',
      });
    }
  };

  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Popover.Content className="p-0 w-auto" align="start">
        <Button
          type="button"
          variant="secondary"
          className="text-primary"
          disabled={!isPrintablePutResponse(row)}
          onClick={handlePrint}
        >
          <IconPrinter />
          {t('print')}
        </Button>
      </Popover.Content>
    </Popover>
  );
};

export const putResponseMoreColumn = (timeZone: string) => ({
  id: 'more',
  header: () => <RecordTable.ColumnSelector />,
  cell: ({ cell }: { cell: Cell<IPutResponse, unknown> }) => (
    <PutResponseMoreColumnCell cell={cell} timeZone={timeZone} />
  ),
  size: 33,
});
