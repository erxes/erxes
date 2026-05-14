import { Command, Filter, useMultiQueryState } from 'erxes-ui';
import { SelectMember, SelectTags, TagsSelect } from 'ui-modules';
import { AutomationStatusFilter } from './AutomationStatusFilter';
import { AutomationRecordTableNodeTypeFilter } from './AutomationRecordTableNodeTypeFilter';
import { AutomationNodeType } from '@/automations/types';

export const AutomationRecordTableFilterViews = () => {
  const [queries, setQueries] = useMultiQueryState<{
    searchValue?: string;
    tagIds?: string[];
    createdByIds?: string[];
    updatedByIds?: string[];
    createdAt: string;
    updatedAt: string;
  }>([
    'searchValue',
    'tagIds',
    'createdByIds',
    'updatedByIds',
    'createdAt',
    'updatedAt',
  ]);

  const { tagIds, createdByIds, updatedByIds, searchValue } = queries;

  return (
    <>
      <Filter.View filterKey="searchValue">
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
      </Filter.View>
      <Filter.View filterKey="status">
        <AutomationStatusFilter />
      </Filter.View>
      <Filter.View filterKey="createdAt">
        <Filter.DateView filterKey="createdAt" />
      </Filter.View>
      <Filter.View filterKey="createdByIds">
        <SelectMember.Provider
          value={createdByIds || []}
          mode="multiple"
          onValueChange={(memberIds) =>
            setQueries({ createdByIds: memberIds as string[] })
          }
        >
          <SelectMember.Content />
        </SelectMember.Provider>
      </Filter.View>
      <Filter.View filterKey="updatedByIds">
        <SelectMember.Provider
          value={updatedByIds || []}
          mode="multiple"
          onValueChange={(memberIds) =>
            setQueries({ updatedByIds: memberIds as string[] })
          }
        >
          <SelectMember.Content />
        </SelectMember.Provider>
      </Filter.View>
      <Filter.View filterKey="updatedAt">
        <Filter.DateView filterKey="updatedAt" />
      </Filter.View>
      <Filter.View filterKey="triggerTypes">
        <AutomationRecordTableNodeTypeFilter
          nodeType={AutomationNodeType.Trigger}
        />
      </Filter.View>
      <Filter.View filterKey="actionTypes">
        <AutomationRecordTableNodeTypeFilter
          nodeType={AutomationNodeType.Action}
        />
      </Filter.View>
      <Filter.View filterKey="tagIds">
        <TagsSelect.Provider
          type="core:automation"
          value={tagIds || []}
          mode="multiple"
          onValueChange={(tagIds) => setQueries({ tagIds: tagIds as string[] })}
        >
          <TagsSelect.Content />
        </TagsSelect.Provider>
      </Filter.View>
    </>
  );
};
