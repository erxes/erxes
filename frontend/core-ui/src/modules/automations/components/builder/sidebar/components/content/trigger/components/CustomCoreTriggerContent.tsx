import React, { useMemo } from 'react';
import {
  getCoreAutomationTriggerComponent,
  TAutomationTriggerComponent,
} from '@/automations/components/builder/nodes/triggers/coreAutomationTriggers';
import { useCoreCustomTriggerContent } from '@/automations/components/builder/sidebar/hooks/useCoreCustomTriggerContent';
import { Button } from 'erxes-ui';
import { CustomCoreTriggerContentProps } from '@/automations/components/builder/sidebar/types/sidebarContentTypes';
import { TriggerContentWrapper } from '@/automations/components/builder/sidebar/components/content/trigger/wrapper/TriggerContentWrapper';

/**
 * Custom core trigger content component for built-in core triggers
 */
export const CustomCoreTriggerContent =
  React.memo<CustomCoreTriggerContentProps>(({ activeNode, moduleName }) => {
    const { formRef, handleSave } = useCoreCustomTriggerContent(activeNode);

    const Component = getCoreAutomationTriggerComponent(
      moduleName as any,
      TAutomationTriggerComponent.Sidebar,
    );

    const footerContent = useMemo(
      () => (
        <Button
          onClick={() => {
            formRef.current?.submit();
          }}
          aria-label={`Save ${
            activeNode?.type || 'core trigger'
          } configuration`}
        >
          Save Configuration
        </Button>
      ),
      [activeNode?.type],
    );

    const updatedProps = { formRef, activeNode, handleSave };

    return (
      <TriggerContentWrapper
        footer={footerContent}
        aria-label={`Configure ${activeNode?.type || 'core trigger'} settings`}
      >
        {Component && <Component {...updatedProps} />}
      </TriggerContentWrapper>
    );
  });
