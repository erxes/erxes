import {
  IconCalendar,
  IconProgressCheck,
  IconSearch,
  IconTags,
} from '@tabler/icons-react';
import { Command, Filter, Popover, useMultiQueryState } from 'erxes-ui';
import { SelectMember, SelectTags } from 'ui-modules';
import { AutomationStatusFilter } from './AutomationStatusFilter';
import { AutomationRecordTableNodeTypeFilter } from './AutomationRecordTableNodeTypeFilter';
import { AutomationNodeType } from '@/automations/types';
import { AutomationRecordTableNodeTypeBarItems } from './AutomationRecordTableNodeTypeBarItems';

export const AutomationRecordTableFilterBar = () => {
  const [queries, setQueries] = useMultiQueryState<{
    searchValue?: string;
    status?: string;
    tagIds?: string[];
    triggerTypes?: string[];
    actionTypes?: string[];
  }>(['searchValue', 'status', 'tagIds', 'triggerTypes', 'actionTypes']);

  const { status, tagIds, searchValue, triggerTypes, actionTypes } = queries;

  return (
    <Filter.Bar>
      <Filter.BarItem queryKey="searchValue">
        <Filter.BarName>
          <IconSearch />
          Search
        </Filter.BarName>

        <Popover>
          <Popover.Trigger asChild>
            <div className="px-2 bg-background content-center">
              {searchValue}
            </div>
          </Popover.Trigger>
          <Popover.Content className="p-0">
            <Command>
              <Filter.CommandInput
                placeholder="Search"
                variant="secondary"
                className="bg-background"
                defaultValue={searchValue || ''}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setQueries({ searchValue: e.currentTarget.value });
                  }
                }}
              />
            </Command>
          </Popover.Content>
        </Popover>
      </Filter.BarItem>
      <Filter.BarItem queryKey="status">
        <Filter.BarName>
          <IconProgressCheck />
          Status
        </Filter.BarName>
        <Popover>
          <Popover.Trigger>
            <Filter.BarButton filterKey="status">{status}</Filter.BarButton>
          </Popover.Trigger>
          <Popover.Content className="p-0">
            <AutomationStatusFilter />
          </Popover.Content>
        </Popover>
      </Filter.BarItem>
      <Filter.BarItem queryKey="createdAt">
        <Filter.BarName>
          <IconCalendar />
          Created At
        </Filter.BarName>
        <Filter.Date filterKey="createdAt" />
      </Filter.BarItem>
      <SelectMember.FilterBar label="Created By" queryKey="createdByIds" />
      <Filter.BarItem queryKey="updatedAt">
        <Filter.BarName>
          <IconCalendar />
          Updated At
        </Filter.BarName>
        <Filter.Date filterKey="updatedAt" />
      </Filter.BarItem>
      <SelectMember.FilterBar label="Updated By" queryKey="updatedByIds" />
      {triggerTypes && triggerTypes.length > 0 && (
        <Filter.BarItem queryKey="triggerTypes">
          <Filter.BarName>
            <IconProgressCheck />
            Trigger Types
          </Filter.BarName>
          <Popover>
            <Popover.Trigger>
              <Filter.BarButton filterKey="triggerTypes">
                <AutomationRecordTableNodeTypeBarItems
                  nodeType={AutomationNodeType.Trigger}
                  selectedTypes={triggerTypes || []}
                />
              </Filter.BarButton>
            </Popover.Trigger>
            <Popover.Content className="p-0">
              <AutomationRecordTableNodeTypeFilter
                nodeType={AutomationNodeType.Trigger}
              />
            </Popover.Content>
          </Popover>
        </Filter.BarItem>
      )}
      {actionTypes && actionTypes.length > 0 && (
        <Filter.BarItem queryKey="actionTypes">
          <Popover>
            <Popover.Trigger>
              <Filter.BarButton filterKey="actionTypes">
                <AutomationRecordTableNodeTypeBarItems
                  nodeType={AutomationNodeType.Action}
                  selectedTypes={actionTypes || []}
                />
              </Filter.BarButton>
            </Popover.Trigger>
            <Popover.Content className="p-0">
              <AutomationRecordTableNodeTypeFilter
                nodeType={AutomationNodeType.Action}
              />
            </Popover.Content>
          </Popover>
        </Filter.BarItem>
      )}
      <Filter.BarItem queryKey="tagIds">
        <Filter.BarName>
          <IconTags />
          Tags
        </Filter.BarName>
        <SelectTags.Provider
          tagType="core:automation"
          value={tagIds || []}
          mode="multiple"
          onValueChange={(tagIds) => setQueries({ tagIds: tagIds as string[] })}
        >
          <Popover>
            <Popover.Trigger>
              <Filter.BarButton filterKey="tagIds">
                <SelectTags.List />
              </Filter.BarButton>
            </Popover.Trigger>
            <Popover.Content className="p-0">
              <SelectTags.Content />
            </Popover.Content>
          </Popover>
        </SelectTags.Provider>
      </Filter.BarItem>
    </Filter.Bar>
  );
};
