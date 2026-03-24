import { toggleAutomationBuilderOpenSidebar } from '@/automations/states/automationState';
import { IconBolt, IconPlus } from '@tabler/icons-react';
import { Node, NodeProps } from '@xyflow/react';
import { Button, Card } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { memo } from 'react';

export const PlaceHolderNode = memo((props: NodeProps<Node<any>>) => {
  const toggleSideBarOpen = useSetAtom(toggleAutomationBuilderOpenSidebar);

  return (
    <Card className="w-80 bg-background shadow-lg border-0 relative">
      <div className="absolute -top-5 left-4">
        <span className="bg-primary/10 text-primary px-3 py-1 rounded-t-md text-sm font-medium">
          Trigger
        </span>
      </div>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <IconBolt className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Choose Trigger</h3>
        </div>
        <p className="text-accent-foreground text-sm mb-6">
          Select an event that will start your automation workflow
        </p>
        <Button
          variant="ghost"
          className="border-2 border-dashed border-foreground/30 w-full h-12"
          onClick={toggleSideBarOpen}
        >
          <IconPlus className="w-12 h-12 text-foreground/40" />
        </Button>
      </div>
      {/* Connection Point */}
      <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2">
        <div className="w-4 h-4 bg-primary rounded-full border-2 border-white shadow-md"></div>
      </div>
    </Card>
  );
});
