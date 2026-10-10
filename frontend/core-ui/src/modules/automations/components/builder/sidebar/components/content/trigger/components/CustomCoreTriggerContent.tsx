import React, { Suspense, useMemo } from 'react';
import {
  getCoreAutomationTriggerComponent,
  TAutomationTriggerComponent,
} from '@/automations/components/builder/nodes/triggers/coreAutomationTriggers';
import { useCoreCustomTriggerContent } from '@/automations/components/builder/sidebar/hooks/useCoreCustomTriggerContent';
import { Button } from 'erxes-ui';
import { CustomCoreTriggerContentProps } from '@/automations/components/builder/sidebar/types/sidebarContentTypes';
import { TriggerContentWrapper } from '@/automations/components/builder/sidebar/components/content/trigger/wrapper/TriggerContentWrapper';
import { TriggerContentLoadingFallback } from '@/automations/components/builder/sidebar/components/content/trigger/wrapper/TriggerContentLoadingFallback';
import { useTranslation } from 'react-i18next';

/**
 * Custom core trigger content component for built-in core triggers
 */
export const CustomCoreTriggerContent =
  React.memo<CustomCoreTriggerContentProps>(({ activeNode, moduleName }) => {
    const { t } = useTranslation('automations');
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
          aria-label={t('sidebar-save-trigger-configuration-aria', {
            type: activeNode?.type || 'core trigger',
          })}
        >
          {t('save-configuration')}
        </Button>
      ),
      [activeNode?.type, t],
    );

    const updatedProps = { formRef, activeNode, handleSave };

    return (
      <TriggerContentWrapper
        footer={footerContent}
        aria-label={t('sidebar-configure-trigger-settings-aria', {
          type: activeNode?.type || 'core trigger',
        })}
      >
        <Suspense fallback={<TriggerContentLoadingFallback />}>
          {Component && <Component {...updatedProps} />}
        </Suspense>
      </TriggerContentWrapper>
    );
  });
