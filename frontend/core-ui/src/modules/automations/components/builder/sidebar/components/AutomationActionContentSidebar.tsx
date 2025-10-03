import { ErrorState } from '@/automations/utils/ErrorState';
import { RenderPluginsComponentWrapper } from '@/automations/utils/RenderPluginsComponentWrapper';
import { Button, Card, Form, Spinner, toast } from 'erxes-ui';
import { Suspense, useRef } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { getAutomationTypes } from 'ui-modules';
import { coreActionNames } from '../../nodes/actions/CoreActions';
import { useAutomationActionContentSidebar } from '../hooks/useAutomationActionContentSidebar';

export const AutomationActionContentSidebar = () => {
  const formRef = useRef<{ submit: () => void }>(null);
  const {
    currentIndex,
    Component,
    currentAction,
    control,
    setQueryParams,
    setValue,
    toggleSideBarOpen,
  } = useAutomationActionContentSidebar();

  if (!currentAction || currentIndex === -1) {
    return <Card.Content>Something went wrong</Card.Content>;
  }

  const isCoreAction = coreActionNames.includes(currentAction?.type || '');

  if (!isCoreAction) {
    const [pluginName, moduleName] = getAutomationTypes(
      currentAction?.type || '',
    );
    const onSaveActionConfig = (config: any) => {
      setValue(`actions.${currentIndex}.config`, config);
      setQueryParams({ activeNodeId: null });
      toggleSideBarOpen();
      toast({
        title: 'Action configuration added successfully.',
      });
    };

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
                  onSaveActionConfig,
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
        <Form.Field
          name={`actions.${currentIndex}.config`}
          control={control}
          render={({ field }) => (
            <Component
              currentActionIndex={currentIndex}
              currentAction={currentAction}
              handleSave={(config: any) =>
                field.onChange({
                  ...(currentAction?.config || {}),
                  ...config,
                })
              }
            />
          )}
        />
      </ErrorBoundary>
    </Suspense>
  );
};
