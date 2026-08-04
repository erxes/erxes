import { AutomationNodeType } from '@/automations/types';
import {
  IconCalendar,
  IconProgressCheck,
  IconSearch,
  IconTags,
} from '@tabler/icons-react';
import { Command, Filter, Popover, useMultiQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { SelectMember, TagsSelect } from 'ui-modules';
import { AutomationRecordTableNodeTypeBarItems } from './AutomationRecordTableNodeTypeBarItems';
import { AutomationRecordTableNodeTypeFilter } from './AutomationRecordTableNodeTypeFilter';
import { AutomationStatusFilter } from './AutomationStatusFilter';

export const AutomationRecordTableFilterBar = () => {
  const [queries, setQueries] = useMultiQueryState<{
    searchValue?: string;
    status?: string;
    tagIds?: string[];
    triggerTypes?: string[];
    actionTypes?: string[];
  }>(['searchValue', 'status', 'tagIds', 'triggerTypes', 'actionTypes']);

  const { status, tagIds, searchValue, triggerTypes, actionTypes } = queries;
  const { t } = useTranslation('automations');

  return (
    <Filter.Bar>
      <Filter.BarItem queryKey="searchValue">
        <Filter.BarName>
          <IconSearch />
          {t('search-filter')}
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
                placeholder={t('search-filter')}
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
          {t('status-filter')}
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
          {t('created-at-filter')}
        </Filter.BarName>
        <Filter.Date filterKey="createdAt" />
      </Filter.BarItem>
      <SelectMember.FilterBar label={t('created-by')} queryKey="createdByIds" />
      <Filter.BarItem queryKey="updatedAt">
        <Filter.BarName>
          <IconCalendar />
          {t('updated-at-filter')}
        </Filter.BarName>
        <Filter.Date filterKey="updatedAt" />
      </Filter.BarItem>
      <SelectMember.FilterBar
        label={t('updated-user')}
        queryKey="updatedByIds"
      />
      {triggerTypes && triggerTypes.length > 0 && (
        <Filter.BarItem queryKey="triggerTypes">
          <Filter.BarName>
            <IconProgressCheck />
            {t('trigger-types-filter')}
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
          {t('tags')}
        </Filter.BarName>
        <TagsSelect.Provider
          type="core:automation"
          value={tagIds || []}
          mode="multiple"
          onValueChange={(tagIds) => setQueries({ tagIds: tagIds as string[] })}
        >
          <Popover>
            <Popover.Trigger>
              <Filter.BarButton filterKey="tagIds">
                <TagsSelect.SelectedList />
              </Filter.BarButton>
            </Popover.Trigger>
            <Popover.Content className="p-0">
              <TagsSelect.Content />
            </Popover.Content>
          </Popover>
        </TagsSelect.Provider>
      </Filter.BarItem>
    </Filter.Bar>
  );
};
