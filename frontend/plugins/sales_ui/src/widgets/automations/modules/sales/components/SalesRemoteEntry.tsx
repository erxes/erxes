import { lazy } from 'react';
import {
  AutomationRemoteEntryProps,
  AutomationRemoteEntryWrapper,
  AutomationExecutionHistoryNameProps,
} from 'ui-modules';
import { IDeal } from '@/deals/types/deals';
import { Button } from 'erxes-ui/components';
import { Link } from 'react-router';
import { IconExternalLink } from '@tabler/icons-react';

const SalesActionConfigForm = lazy(() =>
  import('./action/SalesActionConfigForm').then((module) => ({
    default: module.SalesActionConfigForm,
  })),
);

const SalesActionNodeContent = lazy(() =>
  import('./action/SalesActionNodeContent').then((module) => ({
    default: module.SalesActionNodeContent,
  })),
);

const SalesActionHistoryResult = lazy(() =>
  import('./action/SalesActionHistoryResultColumn').then((module) => ({
    default: module.SalesActionHistoryResult,
  })),
);
const StageProbalityTriggerConfigForm = lazy(() =>
  import('./trigger/StageProbalityTriggerConfigForm').then((module) => ({
    default: module.StageProbalityTriggerConfigForm,
  })),
);

const StageProbalityTriggerNodeContent = lazy(() =>
  import('./trigger/StageProbalityTriggerNodeContent').then((module) => ({
    default: module.StageProbalityTriggerNodeContent,
  })),
);

export const SalesRemoteEntry = (props: AutomationRemoteEntryProps) => {
  return (
    <AutomationRemoteEntryWrapper
      props={props}
      remoteEntries={{
        actionForm: SalesActionConfigForm,
        triggerForm: StageProbalityTriggerConfigForm,
        triggerConfigContent: StageProbalityTriggerNodeContent,
        actionNodeConfiguration: SalesActionNodeContent,
        historyActionResult: SalesActionHistoryResult,
        // historyName: ({ target }: AutomationExecutionHistoryNameProps<IDeal>) =>
        //   target?.name,
        historyName: ({
          target,
        }: AutomationExecutionHistoryNameProps<IDeal>) => {
          return (
            <Button asChild variant="link">
              <Link
                target="_blank"
                to={`http://localhost:3001/sales/deals?salesItemId=${target._id}`}
              >
                {target?.name || 'See Customer'}
                <IconExternalLink />
              </Link>
            </Button>
          );
        },
      }}
    />
  );
};
