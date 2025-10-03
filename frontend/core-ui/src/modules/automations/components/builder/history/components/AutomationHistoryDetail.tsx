import {
  IconAutomaticGearbox,
  IconEye,
  IconTournament,
} from '@tabler/icons-react';
import { RecordTable, RecordTableInlineCell, Sheet, Tabs } from 'erxes-ui';
import {
  IAutomationHistory,
  IAutomationsActionConfigConstants,
  IAutomationsTriggerConfigConstants,
} from 'ui-modules';
import { AutomationHistoryByFlow } from './AutomationHistoryByFlow';
import { AutomationHistoryByTable } from './AutomationHistoryByTable';
import { useState } from 'react';

export const AutomationHistoryDetail = ({
  history,
  constants,
}: {
  history: IAutomationHistory;
  constants: {
    triggersConst: IAutomationsTriggerConfigConstants[];
    actionsConst: IAutomationsActionConfigConstants[];
  };
}) => {
  const [isOpen, setOpen] = useState(false);

  return (
    <RecordTableInlineCell>
      <Sheet open={isOpen} onOpenChange={setOpen}>
        <Sheet.Trigger asChild>
          <RecordTable.MoreButton className="w-full h-full">
            <IconEye />
          </RecordTable.MoreButton>
        </Sheet.Trigger>
        <Sheet.View className="p-0 md:w-[calc(100vw-theme(spacing.4))] flex flex-col gap-0 transition-all duration-100 ease-out overflow-hidden flex-none sm:max-w-screen-2xl">
          {isOpen && (
            <>
              <Sheet.Header>
                <div>
                  <Sheet.Title>Execution history</Sheet.Title>
                  <Sheet.Description>
                    View the execution log of your automation in table or flow
                    format.
                  </Sheet.Description>
                </div>
                <Sheet.Close />
              </Sheet.Header>
              <Sheet.Content>
                <Tabs defaultValue="table" className="h-full">
                  <Tabs.List className="w-full">
                    <Tabs.Trigger value="table">
                      <IconAutomaticGearbox />
                      View as table
                    </Tabs.Trigger>
                    <Tabs.Trigger value="flow">
                      <IconTournament className="scale-x-[-1]" />
                      View as flow
                    </Tabs.Trigger>
                  </Tabs.List>
                  <Tabs.Content value="flow" className="h-[calc(100%-36px)]">
                    <AutomationHistoryByFlow
                      history={history}
                      constants={constants}
                    />
                  </Tabs.Content>

                  <Tabs.Content value="table" className="h-[calc(100%-36px)]">
                    <AutomationHistoryByTable
                      history={history}
                      constants={constants}
                    />
                  </Tabs.Content>
                </Tabs>
              </Sheet.Content>
            </>
          )}
        </Sheet.View>
      </Sheet>
    </RecordTableInlineCell>
  );
};
