import { IconExternalLink } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { Link } from 'react-router-dom';
import {
  AutomationExecutionActionResultProps,
  getSidePanelRecordPath,
  SIDE_PANEL_QUERY_KEY,
} from 'ui-modules';
import { POS_ORDER_CONTENT_TYPE } from '@/pos/constants/posPanel';

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const getString = (data: Record<string, unknown>, key: string) => {
  const value = data[key];

  return value === undefined || value === null ? '' : String(value);
};

export const PosActionHistoryResult = ({
  result,
}: AutomationExecutionActionResultProps) => {
  const resultRecord = toRecord(result);
  const posId = getString(resultRecord, 'posId');
  const orderId =
    getString(resultRecord, 'orderId') || getString(resultRecord, 'targetId');
  const name =
    getString(resultRecord, 'name') || getString(resultRecord, 'number');

  if (!posId || !orderId) {
    return <span>{name || '-'}</span>;
  }

  return (
    <div>
      <Link
        to={`/sales/pos/${posId}/orders?${new URLSearchParams({
          [SIDE_PANEL_QUERY_KEY]: getSidePanelRecordPath({
            contentType: POS_ORDER_CONTENT_TYPE,
            contentId: orderId,
          }),
        }).toString()}`}
        target="_blank"
      >
        <Button variant="link" className="w-full">
          {name || orderId}
          <IconExternalLink />
        </Button>
      </Link>
    </div>
  );
};
