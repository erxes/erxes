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
  type: AutomationNodeType;
  list:
    | IAutomationsTriggerConfigConstants[]
    | IAutomationsActionConfigConstants[];
  onDragStart: (
    event: React.DragEvent<HTMLDivElement>,
    { type, label, description, icon, isCustom }: any,
  ) => void;
}

export const TabContentWrapper = ({
  loading,
  error,
  refetch,
  type,
  list,
  onDragStart,
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
      {list.map((item, index) => (
        <NodeLibraryRow
          key={index}
          item={item}
          nodeType={type}
          onDragStart={onDragStart}
        />
      ))}
    </>
  );
};
