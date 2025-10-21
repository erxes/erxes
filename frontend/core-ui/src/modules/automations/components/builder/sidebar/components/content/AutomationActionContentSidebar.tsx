import { AutomationCoreActionSidebarContent } from '@/automations/components/builder/sidebar/components/content/AutomationCoreActionSidebarContent';
import { ErrorState } from '@/automations/components/common/ErrorState';
import { RenderPluginsComponentWrapper } from '@/automations/components/common/RenderPluginsComponentWrapper';
import { Button, Card, Spinner } from 'erxes-ui';
import { Suspense, useRef } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useAutomationActionContentSidebar } from '@/automations/components/builder/sidebar/hooks/useAutomationActionContentSidebar';

export const AutomationActionContentSidebar = () => {
  const formRef = useRef<{ submit: () => void }>(null);
  const {
    currentIndex,
    isCoreActionComponent,
    currentAction,
    onSaveActionConfig,
    pluginName,
    moduleName,
  } = useAutomationActionContentSidebar();

  if (!currentAction || currentIndex === -1) {
    return <Card.Content>Something went wrong</Card.Content>;
  }

  if (!isCoreActionComponent) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 w-auto">
          <Suspense fallback={<Spinner />}>
            <ErrorBoundary
              FallbackComponent={({ resetErrorBoundary }) => (
                <ErrorState onRetry={resetErrorBoundary} />
              )}
            >
              <RenderPluginsComponentWrapper
                pluginName={pluginName}
                moduleName={moduleName}
                props={{
                  formRef: formRef,
                  componentType: 'actionForm',
                  type: currentAction?.type,
                  currentAction,
                  onSaveActionConfig: onSaveActionConfig,
                }}
              />
            </ErrorBoundary>
          </Suspense>
        </div>
        <div className="p-2 flex justify-end border-t bg-white">
          <Button onClick={() => formRef.current?.submit()}>Save</Button>
        </div>
      </div>
    );
  }

  return (
    <AutomationCoreActionSidebarContent
      currentIndex={currentIndex}
      currentAction={currentAction}
      onSaveActionConfig={onSaveActionConfig}
    />
  );
};
