import { NodeIssuesProvider } from '@/automations/components/builder/nodes/components/NodeIssuesProvider';
import { useActionNodeConfigurationContent } from '@/automations/components/builder/nodes/hooks/useActionNodeConfigurationContent';
import { isSameActionNodeContent } from '@/automations/components/builder/nodes/utils/isEqualConfig';
import { NodeData } from '@/automations/types';
import { Skeleton } from 'erxes-ui';
import { memo, Suspense } from 'react';

const ActionNodeConfigurationContentComponent = ({
  data,
}: {
  data: NodeData;
}) => {
  const { Component, isVisible } = useActionNodeConfigurationContent(data);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="p-3">
      <div className="rounded border bg-muted text-muted-foreground overflow-x-auto">
        {/* Action content loads lazily; without a boundary here the closest one
            is the route's, which blanks the whole page on first render */}
        <Suspense fallback={<Skeleton className="m-2 h-8" />}>
          <NodeIssuesProvider nodeId={data.id} readOnly={data.readOnly}>
            {Component}
          </NodeIssuesProvider>
        </Suspense>
      </div>
    </div>
  );
};

export const ActionNodeConfigurationContent = memo(
  ActionNodeConfigurationContentComponent,
  isSameActionNodeContent,
);
