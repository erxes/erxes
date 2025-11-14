import { TDraggingNode } from '@/automations/components/builder/sidebar/states/automationNodeLibrary';
import { useAutomationsRecordTable } from '@/automations/hooks/useAutomationsRecordTable';
import { AutomationNodeType } from '@/automations/types';
import { Button, Card, Command, RelativeDateDisplay } from 'erxes-ui';
import { IconArrowsSplit2, IconExternalLink } from '@tabler/icons-react';
import React from 'react';
import { Link, useParams } from 'react-router';

interface WorkflowsNodeLibraryProps {
  onDragStart: (
    event: React.DragEvent<HTMLDivElement>,
    draggingNode: Extract<
      TDraggingNode,
      { nodeType: AutomationNodeType.Workflow }
    >,
  ) => void;
}

export const WorkflowsNodeLibrary = ({
  onDragStart,
}: WorkflowsNodeLibraryProps) => {
  const { id } = useParams();

  const { list } = useAutomationsRecordTable({
    variables: { excludeIds: [id] },
  });

  return (
    <>
      {list.map(({ _id, name = '', createdAt = '' }) => (
        <Command.Item key={_id} value={name} asChild>
          <Card
            className="hover:shadow-md transition-shadow cursor-pointer border-accent cursor-grab hover:bg-accent transition-colors h-16 mb-2 w-[350px] sm:w-[500px] hover:border-warning"
            draggable
            onDragStart={(event) =>
              onDragStart(event, {
                nodeType: AutomationNodeType.Workflow,
                automationId: _id,
                name,
                description: 'Hello World',
              })
            }
          >
            <Card.Content className="p-3 w-full">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-warning/10 text-warning border-warning">
                  <IconArrowsSplit2 />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-4">
                    <h3 className="font-semibold text-foreground text-sm">
                      {name}
                    </h3>
                  </div>
                  <p className="text-accent-foreground leading-relaxed text-xs">
                    <RelativeDateDisplay.Value value={createdAt} />
                  </p>
                </div>
                <Link to={`/automations/edit/${_id}`}>
                  <Button variant="link">
                    <IconExternalLink />
                  </Button>
                </Link>
              </div>
            </Card.Content>
          </Card>
        </Command.Item>
      ))}
    </>
  );
};
