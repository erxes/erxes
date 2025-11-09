import { IconExternalLink } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { AutomationExecutionActionResultProps } from 'ui-modules';

export const SalesActionHistoryResult = ({
  result,
}: AutomationExecutionActionResultProps) => {
  return (
    <div>
      <Link
        to={`/deals?boardId=${result.boardId}&pipelineId=${result.pipelineId}&salesItemId=${result.itemId}`}
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
