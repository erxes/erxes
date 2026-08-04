import { AutomationsHotKeyScope, IAutomation } from '@/automations/types';
import { ApolloError } from '@apollo/client';
import { Row } from '@tanstack/react-table';
import { CommandBar, RecordTable, Separator, toast } from 'erxes-ui';
import { AutomationRemoveButtonCommandBar } from '@/automations/components/list/AutomationRemoveButtonCommandBar';
import { Can, TagsSelect } from 'ui-modules';

const intersection = (arrays: string[][]): string[] => {
  if (arrays.length === 0) return [];

  return arrays.reduce((common, current) =>
    common.filter((item) => current.includes(item)),
  );
};

export const AutomationRecordTableCommandBar = () => {
  const { table } = RecordTable.useRecordTable();
  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const automationIds = selectedRows.map(
    (row: Row<IAutomation>) => row.original._id,
  );
  const tagIds = intersection(
    selectedRows.map((row: Row<IAutomation>) => row.original.tagIds || []),
  );

  const isSelected = selectedRows.length > 0;
  return (
    <CommandBar open={isSelected}>
      <CommandBar.Bar>
        <CommandBar.Value>{selectedRows.length} selected</CommandBar.Value>
        <Can action="tagsTag">
          <>
            <Separator.Inline />
            <TagsSelect
              scope={AutomationsHotKeyScope.AutomationsTableInlinePopover}
              type="core:automation"
              mode="multiple"
              variant="secondary"
              className="shadow-none"
              value={tagIds}
              targetIds={automationIds}
              options={(newSelectedTagIds) => ({
                update: (cache) => {
                  automationIds.forEach((automationId) => {
                    cache.modify({
                      id: cache.identify({
                        __typename: 'Automation',
                        _id: automationId,
                      }),
                      fields: {
                        tagIds: () => newSelectedTagIds,
                      },
                    });
                  });
                },
                onError: (e: ApolloError) => {
                  toast({
                    title: 'Error',
                    description: e.message,
                    variant: 'destructive',
                  });
                },
              })}
            />
          </>
        </Can>
        <Can action="automationsDelete">
          <>
            <Separator.Inline />
            <AutomationRemoveButtonCommandBar
              automationIds={automationIds}
              rows={selectedRows}
            />
          </>
        </Can>
      </CommandBar.Bar>
    </CommandBar>
  );
};
