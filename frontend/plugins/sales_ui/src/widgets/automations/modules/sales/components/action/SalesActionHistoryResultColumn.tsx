import { IconExternalLink } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { AutomationExecutionActionResultProps } from 'ui-modules';

type TChecklistActionResult = {
  checklistId: string;
  checklistTitle: string;
  targetId: string;
  boardId?: string;
  pipelineId?: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const getStringValue = (
  source: Record<string, unknown>,
  key: string,
): string | undefined => {
  const value = source[key];
  return typeof value === 'string' && value ? value : undefined;
};

const getChecklistActionResult = (
  result: unknown,
): TChecklistActionResult | undefined => {
  if (!isRecord(result)) {
    return undefined;
  }

  const checklistId = getStringValue(result, 'checklistId');
  const checklistTitle = getStringValue(result, 'checklistTitle');
  const targetId = getStringValue(result, 'targetId');

  if (!checklistId || !checklistTitle || !targetId) {
    return undefined;
  }

  return {
    checklistId,
    checklistTitle,
    targetId,
    boardId: getStringValue(result, 'boardId'),
    pipelineId: getStringValue(result, 'pipelineId'),
  };
};

export const SalesActionHistoryResult = ({
  result,
}: AutomationExecutionActionResultProps) => {
  const checklistResult = getChecklistActionResult(result);

  if (checklistResult) {
    const query = new URLSearchParams({
      salesItemId: checklistResult.targetId,
    });

    if (checklistResult.boardId) {
      query.set('boardId', checklistResult.boardId);
    }

    if (checklistResult.pipelineId) {
      query.set('pipelineId', checklistResult.pipelineId);
    }

    return (
      <div>
        <Link to={`/sales/deals?${query.toString()}`} target="_blank">
          <Button variant="link" className="w-full">
            {checklistResult.checklistTitle || 'Sales checklist'}
            <IconExternalLink />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        to={`/sales/deals?boardId=${result.boardId}&pipelineId=${result.pipelineId}&salesItemId=${result.targetId}`}
        target="_blank"
      >
        <Button variant="link" className="w-full">
          {result.name}
          <IconExternalLink />
        </Button>
      </Link>
    </div>
  );
};
