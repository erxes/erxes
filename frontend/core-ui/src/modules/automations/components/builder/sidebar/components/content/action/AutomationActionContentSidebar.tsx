import { AutomationConfigFormWrapper } from '@/automations/components/builder/nodes/components/AutomationConfigFormWrapper';
import { ActionErrorPolicySection } from '@/automations/components/builder/sidebar/components/content/action/ActionErrorPolicySection';
import { AutomationCoreActionSidebarContent } from '@/automations/components/builder/sidebar/components/content/action/AutomationCoreActionSidebarContent';
import { useAutomationActionContentSidebar } from '@/automations/components/builder/sidebar/hooks/useAutomationActionContentSidebar';
import { AutomationErrorState } from '@/automations/components/common/AutomationErrorState';
import { RenderPluginsComponentWrapper } from '@/automations/components/common/RenderPluginsComponentWrapper';
import { Card, Spinner, toast } from 'erxes-ui';
import { Suspense, useRef } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

export const AutomationActionContentSidebar = () => {
  const formRef = useRef<{ submit: () => void }>(null);
  const {
    currentIndex,
    isCoreActionComponent,
    currentAction,
    onSaveActionConfig,
    pluginName,
    moduleName,
    trigger,
    targetType,
    previousActions,
  } = useAutomationActionContentSidebar();

  if (!currentAction || currentIndex === -1) {
    return <Card.Content>Something went wrong</Card.Content>;
  }

  const errorPolicy = (
    <ActionErrorPolicySection
      currentIndex={currentIndex}
      currentAction={currentAction}
    />
  );

  if (!isCoreActionComponent) {
    return (
      <div className="flex h-full min-h-0 flex-col">
        <div className="min-h-0 flex-1 overflow-hidden">
          <AutomationConfigFormWrapper
            onSave={() => {
              if (
                !formRef.current ||
                typeof formRef.current.submit !== 'function'
              ) {
                toast({
                  title: 'Form is not configured',
                  description: 'Please configure the action form before saving',
                  variant: 'destructive',
                });
                return;
              }
              formRef.current.submit();
            }}
          >
            <Suspense fallback={<Spinner />}>
              <ErrorBoundary
                FallbackComponent={({ resetErrorBoundary }) => (
                  <AutomationErrorState onRetry={resetErrorBoundary} />
                )}
              >
                <RenderPluginsComponentWrapper
                  key={currentAction.id}
                  pluginName={pluginName}
                  moduleName={moduleName}
                  props={{
                    formRef,
                    componentType: 'actionForm',
                    type: currentAction?.type,
                    currentAction,
                    onSaveActionConfig: onSaveActionConfig,
                    trigger,
                    targetType,
                    previousActions,
                  }}
                />
              </ErrorBoundary>
            </Suspense>
          </AutomationConfigFormWrapper>
        </div>
        {errorPolicy}
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-hidden">
        <AutomationCoreActionSidebarContent
          key={currentAction.id}
          currentIndex={currentIndex}
          currentAction={currentAction}
          onSaveActionConfig={onSaveActionConfig}
        />
      </div>
      {errorPolicy}
    </div>
  );
};
