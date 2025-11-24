import { getCoreAutomationActionComponent } from '@/automations/components/builder/nodes/actions/coreAutomationActions';
import { TAutomationActionComponent } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { ErrorState } from '@/automations/components/common/ErrorState';
import { TAutomationBuilderActions } from '@/automations/utils/automationFormDefinitions';
import { Card, Spinner } from 'erxes-ui';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

type Props = {
  currentIndex: number;
  currentAction: TAutomationBuilderActions[number];
  onSaveActionConfig: (config: any) => void;
};

export const AutomationCoreActionSidebarContent = ({
  currentIndex,
  currentAction,
  onSaveActionConfig,
}: Props) => {
  const Component = getCoreAutomationActionComponent(
    currentAction.type,
    TAutomationActionComponent.Sidebar,
  );

  if (!Component) {
    return (
      <Card.Content>Unknown action type: {currentAction.type}</Card.Content>
    );
  }

  return (
    <Suspense fallback={<Spinner />}>
      <ErrorBoundary
        FallbackComponent={({ resetErrorBoundary }) => (
          <ErrorState onRetry={resetErrorBoundary} />
        )}
      >
        <Component
          currentActionIndex={currentIndex}
          currentAction={currentAction}
          handleSave={(config) => {
            onSaveActionConfig({
              ...(currentAction?.config || {}),
              ...config,
            });
          }}
        />
      </ErrorBoundary>
    </Suspense>
  );
};
