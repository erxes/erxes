import {
  Button,
  cn,
  Collapsible,
  ScrollArea,
  Separator,
  SideMenu,
  Tabs,
  ToggleGroup,
  useQueryState,
} from 'erxes-ui';
import {
  IconCaretRightFilled,
  IconChartHistogram,
  IconChevronDown,
} from '@tabler/icons-react';
import { Progress } from './Progress';
import { ProgressChart } from './ProgressChart';
import { useState } from 'react';
import { ProgressByAssignee } from './ProgressByAssignee';

export enum ConversationsSideWidgetTabsEnum {
  Assignee = 'assignee',
  Source = 'source',
  Tag = 'tag',
}

export const ConversationReportContent = ({
  conversationId,
}: {
  conversationId?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible
      defaultOpen={open}
      onOpenChange={setOpen}
      className="group/collapsible-menu"
    >
      <Collapsible.Trigger asChild>
        <div className="flex items-center justify-between">
          <Button variant="secondary" size="sm" onClick={() => setOpen(!open)}>
            <IconCaretRightFilled className="transition-transform group-data-[state=open]/collapsible-menu:rotate-90 size-3.5" />
            Progress
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => e.stopPropagation()}
            className="ml-auto"
          >
            <IconChevronDown />
            All Time
          </Button>
        </div>
      </Collapsible.Trigger>
      <div className={cn('border-b', open && 'border-b-0')}>
        <Progress conversationId={conversationId as string} />
      </div>
      <Collapsible.Content>
        <div className={cn('border-b-0', open && 'border-b')}>
          <ProgressChart conversationId={conversationId as string} />
        </div>
        <ConversationsSideWidgetTabs>
          <Tabs.Content value={ConversationsSideWidgetTabsEnum.Assignee}>
            <ProgressByAssignee />
          </Tabs.Content>
          <Tabs.Content value={ConversationsSideWidgetTabsEnum.Source}>
            <p>Progress by source</p>
          </Tabs.Content>
          <Tabs.Content value={ConversationsSideWidgetTabsEnum.Tag}>
            <p>Progress by tag</p>
          </Tabs.Content>
        </ConversationsSideWidgetTabs>
      </Collapsible.Content>
    </Collapsible>
  );
};

export const ConversationsSideWidgetTabs = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [value, setValue] = useState<ConversationsSideWidgetTabsEnum>(
    ConversationsSideWidgetTabsEnum.Assignee,
  );
  return (
    <>
      <div className="p-4 pb-0 space-y-3 overflow-hidden flex-auto flex flex-col rounded-xl shadow-2xs border border-border my-2">
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          defaultValue={ConversationsSideWidgetTabsEnum.Assignee}
          value={value}
          onValueChange={(value) => {
            if (!value) {
              return null;
            }
            setValue(value as ConversationsSideWidgetTabsEnum);
          }}
        >
          <ToggleGroup.Item
            value={ConversationsSideWidgetTabsEnum.Assignee}
            className="flex-auto"
          >
            Assignee
          </ToggleGroup.Item>
          <ToggleGroup.Item
            value={ConversationsSideWidgetTabsEnum.Source}
            className="flex-auto"
          >
            Source
          </ToggleGroup.Item>
          <ToggleGroup.Item
            value={ConversationsSideWidgetTabsEnum.Tag}
            className="flex-auto"
          >
            Tag
          </ToggleGroup.Item>
        </ToggleGroup>
        <Tabs
          value={value}
          defaultValue={ConversationsSideWidgetTabsEnum.Assignee}
          className="overflow-auto flex-auto"
          asChild
        >
          <ScrollArea>{children}</ScrollArea>
        </Tabs>
      </div>
      <Separator />
    </>
  );
};
