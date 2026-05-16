import { LoadingSkeleton } from '@/automations/components/builder/sidebar/components/library/SidebarNodeLibrarySkeleton';
import { AutomationNodeType } from '@/automations/types';
import { ErrorState } from '@/automations/components/common/ErrorState';
import { ApolloError } from '@apollo/client';
import { Command } from 'erxes-ui';
import React from 'react';
import {
  IAutomationsActionConfigConstants,
  IAutomationsTriggerConfigConstants,
} from 'ui-modules';
import { NodeLibraryRow } from '@/automations/components/builder/sidebar/components/library/NodeLibraryRow';

interface TabContentWrapperProps {
  loading: boolean;
  error: ApolloError | undefined;
  refetch: () => void;
  type: AutomationNodeType.Trigger | AutomationNodeType.Action;
  list:
    | IAutomationsTriggerConfigConstants[]
    | IAutomationsActionConfigConstants[];
  groups?: Array<{
    name: string;
    list:
      | IAutomationsTriggerConfigConstants[]
      | IAutomationsActionConfigConstants[];
  }>;
  onDragStart: (
    event: React.DragEvent<HTMLDivElement>,
    { type, label, description, icon, isCustom }: any,
  ) => void;
  onSelectNode: (
    node: (
      | IAutomationsTriggerConfigConstants
      | IAutomationsActionConfigConstants
    ) & { nodeType: AutomationNodeType.Trigger | AutomationNodeType.Action },
  ) => void;
}

export const TabContentWrapper = ({
  loading,
  error,
  refetch,
  type,
  list,
  groups,
  onDragStart,
  onSelectNode,
}: TabContentWrapperProps) => {
  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <ErrorState
        errorCode={error.message}
        errorDetails={error.stack}
        onRetry={refetch}
      />
    );
  }

  return (
    <>
      <Command.Empty />
      {groups?.length ? (
        groups.map((group) => (
          <Command.Group
            key={group.name}
            heading={group.name}
            className="mx-auto max-w-[420px] p-0 pb-4 [&_[cmdk-group-heading]]:px-0 [&_[cmdk-group-heading]]:pb-2 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-items]]:flex [&_[cmdk-group-items]]:flex-col [&_[cmdk-group-items]]:gap-2"
          >
            {group.list.map((item) => (
              <NodeLibraryRow
                key={item.type}
                item={item}
                nodeType={type}
                onDragStart={onDragStart}
                onSelectNode={onSelectNode}
              />
            ))}
          </Command.Group>
        ))
      ) : (
        <Command.Group className="mx-auto max-w-[420px] p-0 [&_[cmdk-group-items]]:flex [&_[cmdk-group-items]]:flex-col [&_[cmdk-group-items]]:gap-2">
          {list.map((item) => (
            <NodeLibraryRow
              key={item.type}
              item={item}
              nodeType={type}
              onDragStart={onDragStart}
              onSelectNode={onSelectNode}
            />
          ))}
        </Command.Group>
      )}
    </>
  );
};
