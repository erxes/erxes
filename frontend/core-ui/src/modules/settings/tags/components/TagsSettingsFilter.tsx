import {
  Combobox,
  Command,
  Filter,
  useFilterContext,
  useFilterQueryState,
} from 'erxes-ui';
import { SettingsHotKeyScope } from '@/types/SettingsHotKeyScope';
import { SelectTagType, SelectTagTypeCommand } from 'ui-modules';
import { IconTagStarred } from '@tabler/icons-react';
import { TagsTotalCount } from './TagsTotalCount';

export const TagsSettingFilter = () => {
  return (
    <Filter id="tags-filter">
      <Filter.Bar>
        <Filter.Popover scope={SettingsHotKeyScope.TagsPage}>
          <Filter.Trigger />
          <Combobox.Content>
            <Filter.View>
              <Command>
                <Filter.CommandInput />
                <Command.List>
                  <Filter.SearchValueTrigger />
                  <Filter.Item value="contentType">
                    <IconTagStarred /> Tags type
                  </Filter.Item>
                </Command.List>
              </Command>
            </Filter.View>
            <TagsTypeFilterView />
          </Combobox.Content>
        </Filter.Popover>
        <Filter.Dialog>
          <Filter.DialogStringView filterKey="searchValue" />
        </Filter.Dialog>
        <Filter.SearchValueBarItem />
        <TagsTypeFilterBar />
        <TagsTotalCount />
      </Filter.Bar>
    </Filter>
  );
};

const TagsTypeFilterView = () => {
  const [contentType, setContentType] = useFilterQueryState(
    'contentType',
    'contentType',
  );
  const { resetFilterState } = useFilterContext();
  return (
    <Filter.View filterKey="contentType">
      <SelectTagTypeCommand
        currentValue={contentType as string}
        handleSelectType={(type) => {
          setContentType(type);
          resetFilterState();
        }}
        forceMount
      />
    </Filter.View>
  );
};

const TagsTypeFilterBar = () => {
  const [contentType, setContentType] = useFilterQueryState(
    'contentType',
    'contentType',
  );
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.BarItem queryKey="contentType">
      <Filter.BarName className="whitespace-nowrap">
        <IconTagStarred />
        Tags type
      </Filter.BarName>
      <SelectTagType
        value={contentType as string}
        className="h-full shadow-none rounded-none"
        onValueChange={(value) => {
          setContentType(value);
          resetFilterState();
        }}
      />
    </Filter.BarItem>
  );
};
