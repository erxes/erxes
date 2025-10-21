import React, { Suspense, useCallback } from 'react';
import { useDefaultTriggerContent } from '@/automations/components/builder/sidebar/hooks/useDefaultTriggerContent';
import { AutomationNodeType } from '@/automations/types';
import { SegmentForm } from 'ui-modules';
import { AutomationTriggerContentProps } from '@/automations/components/builder/sidebar/types/sidebarContentTypes';
import { TriggerContentLoadingFallback } from '@/automations/components/builder/sidebar/components/content/trigger/wrapper/TriggerContentLoadingFallback';

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
        <SegmentForm
          contentType={activeNode?.type || ''}
          segmentId={contentId}
          callback={handleFormCallback}
          isTemporary
          aria-label={`Configure ${
            activeNode?.type || AutomationNodeType.Trigger
          } settings`}
        />
      </Suspense>
    );
  },
);
