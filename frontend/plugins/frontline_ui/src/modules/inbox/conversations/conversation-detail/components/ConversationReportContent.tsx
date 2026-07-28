import {
  Button,
  Collapsible,
  ScrollArea,
  Separator,
  Tabs,
  ToggleGroup,
} from 'erxes-ui';
import { IconCaretRightFilled } from '@tabler/icons-react';
import { Progress } from './Progress';
import { ProgressChart } from './ProgressChart';
import { useState } from 'react';
import { ProgressByAssignee } from './ProgressByAssignee';
import { ProgressSource } from './ProgressSource';
import { ProgressTags } from './ProgressTag';
import { SelectReportDate } from './SelectReportDate';
import { useTranslation } from 'react-i18next';

export enum ConversationsSideWidgetTabsEnum {
  Assignee = 'assignee',
  Source = 'source',
  Tag = 'tag',
}

export const ConversationReportContent = ({
  customerId,
}: {
  customerId?: string;
}) => {
  const { t } = useTranslation('frontline');
  return (
    <>
      <div className="border-b">
        <Collapsible className="group/collapsible-menu" defaultOpen>
          <div className="flex items-center justify-between">
            <Collapsible.Trigger asChild>
              <Button variant="secondary" size="sm">
                <IconCaretRightFilled className="transition-transform group-data-[state=open]/collapsible-menu:rotate-90 size-3.5" />
                {t('progress')}
              </Button>
            </Collapsible.Trigger>
            <SelectReportDate />
          </div>
          <Collapsible.Content>
            <Progress customerId={customerId} />
            <ProgressChart customerId={customerId} />
          </Collapsible.Content>
        </Collapsible>
      </div>
      <ConversationsSideWidgetTabs>
        <Tabs.Content value={ConversationsSideWidgetTabsEnum.Assignee}>
          <ProgressByAssignee customerId={customerId} />
        </Tabs.Content>
        <Tabs.Content value={ConversationsSideWidgetTabsEnum.Source}>
          <ProgressSource customerId={customerId} />
        </Tabs.Content>
        <Tabs.Content value={ConversationsSideWidgetTabsEnum.Tag}>
          <ProgressTags customerId={customerId} />
        </Tabs.Content>
      </ConversationsSideWidgetTabs>
    </>
  );
};

export const ConversationsSideWidgetTabs = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { t } = useTranslation('frontline');
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
            {t('assignee')}
          </ToggleGroup.Item>
          <ToggleGroup.Item
            value={ConversationsSideWidgetTabsEnum.Source}
            className="flex-auto"
          >
            {t('source')}
          </ToggleGroup.Item>
          <ToggleGroup.Item
            value={ConversationsSideWidgetTabsEnum.Tag}
            className="flex-auto"
          >
            {t('tag')}
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
