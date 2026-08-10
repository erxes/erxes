import { IconExternalLink } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { AutomationExecutionActionResultProps } from 'ui-modules';

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
        to={`/sales/pos/${posId}/orders?pos_order_id=${orderId}`}
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
