import React, { Suspense, useCallback, useMemo, useRef } from 'react';
import { useCustomTriggerContent } from '@/automations/components/builder/sidebar/hooks/useCustomTriggerContent';
import { RenderPluginsComponentWrapper } from '@/automations/components/common/RenderPluginsComponentWrapper';
import { AutomationNodeType } from '@/automations/types';
import { Button } from 'erxes-ui';
import { AutomationTriggerContentProps } from '@/automations/components/builder/sidebar/types/sidebarContentTypes';
import { TriggerContentWrapper } from '@/automations/components/builder/sidebar/components/content/trigger/wrapper/TriggerContentWrapper';
import { TriggerContentLoadingFallback } from '@/automations/components/builder/sidebar/components/content/trigger/wrapper/TriggerContentLoadingFallback';

/**
 * Custom remote trigger content component for plugin-based triggers
 */
export const CustomRemoteTriggerContent =
  React.memo<AutomationTriggerContentProps>(({ activeNode }) => {
    const formRef = useRef<{ submit: () => void }>(null);

    const { pluginName, moduleName, activeTrigger, onSaveTriggerConfig } =
      useCustomTriggerContent(activeNode);

    const handleSave = useCallback(() => {
      try {
        formRef.current?.submit();
      } catch (error) {
        console.error('Error submitting trigger form:', error);
      }
    }, []);

    const footerContent = useMemo(
      () => (
        <Button
          onClick={handleSave}
          aria-label={`Save ${
            activeNode?.type || AutomationNodeType.Trigger
          } configuration`}
        >
          Save Configuration
        </Button>
      ),
      [handleSave, activeNode?.type],
    );

    const pluginProps = useMemo(
      () => ({
        formRef,
        componentType: 'triggerForm' as const,
        activeTrigger,
        onSaveTriggerConfig,
      }),
      [activeTrigger, onSaveTriggerConfig],
    );

    return (
      <TriggerContentWrapper
        footer={footerContent}
        aria-label={`Configure ${pluginName} ${moduleName} trigger`}
      >
        <Suspense fallback={<TriggerContentLoadingFallback />}>
          <RenderPluginsComponentWrapper
            pluginName={pluginName}
            moduleName={moduleName}
            props={pluginProps}
          />
        </Suspense>
      </TriggerContentWrapper>
    );
  });
