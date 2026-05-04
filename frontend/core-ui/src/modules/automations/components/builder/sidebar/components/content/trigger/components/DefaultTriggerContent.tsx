import { TriggerContentLoadingFallback } from '@/automations/components/builder/sidebar/components/content/trigger/wrapper/TriggerContentLoadingFallback';
import { useDefaultTriggerContent } from '@/automations/components/builder/sidebar/hooks/useDefaultTriggerContent';
import { AutomationTriggerContentProps } from '@/automations/components/builder/sidebar/types/sidebarContentTypes';
import { AutomationSegmentForm } from '@/automations/components/common/AutomationSegmentForm';
import React, { Suspense, useCallback } from 'react';

/**
 * Default trigger content component for standard automation triggers
 */
export const DefaultTriggerContent = React.memo<AutomationTriggerContentProps>(
  ({ activeNode }) => {
    const { contentId, handleCallback } = useDefaultTriggerContent({
      activeNode,
    });

    const handleFormCallback = useCallback(
      (data: unknown) => {
        try {
          handleCallback(data as string);
        } catch (error) {
          console.error('Error in trigger form callback:', error);
        }
      },
      [handleCallback],
    );

    return (
      <Suspense fallback={<TriggerContentLoadingFallback />}>
        <AutomationSegmentForm
          contentType={activeNode?.type || ''}
          segmentId={contentId}
          callback={handleFormCallback}
        />
      </Suspense>
    );
  },
);
