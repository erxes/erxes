import { AutomationCoreActionSidebarContent } from '@/automations/components/builder/sidebar/components/content/action/AutomationCoreActionSidebarContent';
import { ErrorState } from '@/automations/components/common/ErrorState';
import { RenderPluginsComponentWrapper } from '@/automations/components/common/RenderPluginsComponentWrapper';
import { Button, Card, Spinner, toast } from 'erxes-ui';
import { Suspense, useRef } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useAutomationActionContentSidebar } from '@/automations/components/builder/sidebar/hooks/useAutomationActionContentSidebar';
import { AutomationConfigFormWrapper } from '@/automations/components/builder/nodes/components/AutomationConfigFormWrapper';

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
  } = useAutomationActionContentSidebar();

  if (!currentAction || currentIndex === -1) {
    return <Card.Content>Something went wrong</Card.Content>;
  }

  if (!isCoreActionComponent) {
    return (
      <AutomationConfigFormWrapper
        onSave={() => () => {
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
                trigger,
                targetType,
              }}
            />
          </ErrorBoundary>
        </Suspense>
      </AutomationConfigFormWrapper>
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
