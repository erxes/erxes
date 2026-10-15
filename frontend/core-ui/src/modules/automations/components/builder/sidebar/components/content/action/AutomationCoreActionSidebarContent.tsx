import { getCoreAutomationActionComponent } from '@/automations/components/builder/nodes/actions/coreAutomationActions';
import { TAutomationActionComponent } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { AutomationErrorState } from '@/automations/components/common/AutomationErrorState';
import { TAutomationBuilderActions } from '@/automations/utils/automationFormDefinitions';
import { Card, Spinner } from 'erxes-ui';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('automations');
  const Component = getCoreAutomationActionComponent(
    currentAction.type,
    TAutomationActionComponent.Sidebar,
  );

  if (!Component) {
    return (
      <Card.Content>
        {t('sidebar-unknown-action-type', { type: currentAction.type })}
      </Card.Content>
    );
  }

  return (
    <Suspense fallback={<Spinner />}>
      <ErrorBoundary
        FallbackComponent={({ resetErrorBoundary }) => (
          <AutomationErrorState onRetry={resetErrorBoundary} />
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
