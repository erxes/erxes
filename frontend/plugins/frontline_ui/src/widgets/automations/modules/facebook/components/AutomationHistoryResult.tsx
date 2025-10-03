import { Badge, Tooltip } from 'erxes-ui';
import { AutomationExecutionActionResultProps } from 'ui-modules';

export const AutomationHistoryResult = ({
  result,
}: AutomationExecutionActionResultProps) => {
  if (result?.error) {
    return (
      <Tooltip.Provider>
        <Tooltip>
          <Tooltip.Trigger>
            <Badge variant="destructive">Error</Badge>
          </Tooltip.Trigger>
        </Tooltip>
      </Tooltip.Provider>
    );
  }

  return <Badge variant="success">Sent successfully</Badge>;
};
