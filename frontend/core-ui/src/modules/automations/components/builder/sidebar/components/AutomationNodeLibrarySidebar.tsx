import { ErrorState } from '@/automations/utils/ErrorState';
import { ApolloError } from '@apollo/client';
import { Card, cn, Command, IconComponent, Skeleton, Tabs } from 'erxes-ui';
import React from 'react';
import {
  IAutomationsActionConfigConstants,
  IAutomationsTriggerConfigConstants,
} from 'ui-modules';
import { useAutomationNodeLibrarySidebar } from '../hooks/useAutomationNodeLibrarySidebar';
import { LoadingSkeleton } from '@/automations/components/builder/sidebar/components/SidebarNodeLibrarySkeleton';
import { AutomationNodeType } from '@/automations/types';

export const AutomationNodeLibrarySidebar = () => {
  const {
    actionsConst,
    setQueryParams,
    activeNodeTab,
    triggersConst,
    loading,
    error,
    refetch,
    onDragStart,
  } = useAutomationNodeLibrarySidebar();

  const commonTabContentProps = {
    loading,
    error,
    refetch,
    onDragStart,
  };

  return (
    <Command className="h-full w-2xl">
      <Command.Input
        placeholder="Search..."
        variant="primary"
        className="pl-8"
      />

      <Tabs
        defaultValue={activeNodeTab || 'trigger'}
        onValueChange={(value) =>
          setQueryParams({ activeNodeTab: value as AutomationNodeType })
        }
        className="flex-1 flex flex-col overflow-auto"
      >
        <Tabs.List className="w-full border-b">
          <Tabs.Trigger value="trigger" className="w-1/2">
            Triggers
          </Tabs.Trigger>
          <Tabs.Trigger value="action" className="w-1/2">
            Actions
          </Tabs.Trigger>
        </Tabs.List>

        {[
          {
            type: 'trigger' as AutomationNodeType.Trigger,
            list: triggersConst,
          },
          { type: 'action' as AutomationNodeType.Action, list: actionsConst },
        ].map(({ type, list = [] }, index) => (
          <Tabs.Content
            key={index}
            value={type}
            className="flex-1 p-2 pt-0 mt-0 w-full overflow-auto flex-1"
          >
            <Command.Group className="space-y-2 " heading={type.toUpperCase()}>
              <TabContentWrapper
                {...commonTabContentProps}
                type={type}
                list={list}
              />
            </Command.Group>
          </Tabs.Content>
        ))}
      </Tabs>
    </Command>
  );
};

const TabContentWrapper = ({
  loading,
  error,
  refetch,
  type,
  list,
  onDragStart,
}: {
  loading: boolean;
  error: ApolloError | undefined;
  refetch: () => void;
  type: AutomationNodeType;
  list:
    | IAutomationsTriggerConfigConstants[]
    | IAutomationsActionConfigConstants[];
  onDragStart: (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: AutomationNodeType,
    { type, label, description, icon, isCustom }: any,
  ) => void;
}) => {
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

const NodeLibraryRow = ({
  item,
  onDragStart,
  nodeType,
}: {
  item: IAutomationsTriggerConfigConstants | IAutomationsActionConfigConstants;
  nodeType: AutomationNodeType;
  onDragStart: (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: AutomationNodeType,
    { type, label, description, icon, isCustom }: any,
  ) => void;
}) => {
  const { icon: iconName, label, description } = item;

  return (
    <Command.Item value={label} asChild>
      <Card
        className={cn(
          `hover:shadow-md transition-shadow cursor-pointer border-accent cursor-grab hover:bg-accent transition-colors h-16 mb-2 w-[350px] sm:w-[500px]`,
          {
            'hover:border-success': nodeType === 'action',
            'hover:border-primary': nodeType === 'trigger',
          },
        )}
        draggable
        onDragStart={(event) => onDragStart(event, nodeType, item)}
      >
        <Card.Content className="p-3">
          <div className="flex items-center gap-4">
            <div
              className={cn(`p-3 rounded-lg`, {
                'bg-success/10 text-success border-success':
                  nodeType === 'action',
                'bg-primary/10 text-primary border-primary':
                  nodeType === 'trigger',
              })}
            >
              <IconComponent name={iconName} />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-4">
                <h3 className="font-semibold text-foreground text-sm">
                  {label || ''}
                </h3>
              </div>
              <p className="text-accent-foreground leading-relaxed text-xs">
                {description || ''}
              </p>
            </div>
          </div>
        </Card.Content>
      </Card>
    </Command.Item>
  );
};
