import React, { Suspense, useMemo } from 'react';
import { useCustomRemoteTriggerContent } from '@/automations/components/builder/sidebar/hooks/useCustomRemoteTriggerContent';
import { RenderPluginsComponentWrapper } from '@/automations/components/common/RenderPluginsComponentWrapper';
import { Button } from 'erxes-ui';
import { AutomationTriggerContentProps } from '@/automations/components/builder/sidebar/types/sidebarContentTypes';
import { TriggerContentWrapper } from '@/automations/components/builder/sidebar/components/content/trigger/wrapper/TriggerContentWrapper';
import { TriggerContentLoadingFallback } from '@/automations/components/builder/sidebar/components/content/trigger/wrapper/TriggerContentLoadingFallback';
import { useTranslation } from 'react-i18next';

/**
 * Custom remote trigger content component for plugin-based triggers
 */
export const CustomRemoteTriggerContent =
  React.memo<AutomationTriggerContentProps>(({ activeNode }) => {
    const { t } = useTranslation('automations');
    const { pluginName, moduleName, pluginProps, handleSave, triggerType } =
      useCustomRemoteTriggerContent(activeNode);

    const footerContent = useMemo(
      () => (
        <Button
          onClick={handleSave}
          aria-label={t('sidebar-save-trigger-configuration-aria', {
            type: triggerType,
          })}
        >
          {t('save-configuration')}
        </Button>
      ),
      [handleSave, triggerType, t],
    );

    return (
      <TriggerContentWrapper
        footer={footerContent}
        aria-label={t('sidebar-configure-remote-trigger-aria', {
          pluginName,
          moduleName,
        })}
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
