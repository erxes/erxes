import { IconExternalLink } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { AutomationExecutionActionResultProps } from 'ui-modules';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const toRecord = (value: unknown): Record<string, unknown> =>
  isRecord(value) ? value : {};

const getString = (data: Record<string, unknown>, key: string) => {
  const value = data[key];

  return value === undefined || value === null ? '' : String(value);
};

const getResultPath = (result: Record<string, unknown>) => {
  const targetId = getString(result, 'targetId');

  if (!targetId) {
    return '';
  }

  if (result.teamIds) {
    return `/operation/projects/${targetId}`;
  }

  return `/operation/tasks/${targetId}`;
};

export const OperationActionHistoryResult = ({
  result,
}: AutomationExecutionActionResultProps) => {
  const resultRecord = toRecord(result);
  const targetId = getString(resultRecord, 'targetId');
  const name =
    getString(resultRecord, 'name') ||
    getString(resultRecord, 'number') ||
    targetId;
  const path = getResultPath(resultRecord);

  if (!path) {
    return <span>{name || '-'}</span>;
  }

  return (
    <Link to={path} target="_blank">
      <Button variant="link" className="w-full">
        {name}
        <IconExternalLink />
      </Button>
    </Link>
  );
};
