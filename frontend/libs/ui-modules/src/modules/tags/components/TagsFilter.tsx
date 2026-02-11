import { IconTags } from '@tabler/icons-react';
import {
  Combobox,
  Filter,
  Popover,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import { TagsSelect } from 'ui-modules/modules/tags-new/components/TagsSelect';
import { useState } from 'react';

const TagsFilterCommandItem = () => {
  return (
    <Filter.Item value="tags">
      <IconTags />
      Tags
    </Filter.Item>
  );
};

export const TagsFilterView = ({ tagType }: { tagType?: string }) => {
  const [tags, setTags] = useQueryState<string[]>('tags');
  const { resetFilterState } = useFilterContext();
  return (
    <Filter.View filterKey="tags">
      <TagsSelect.Provider
        type={tagType || null}
        mode="multiple"
        value={tags || []}
        onValueChange={(tags) => {
          setTags(tags as string[]);
          resetFilterState();
        }}
      >
        <TagsSelect.Content />
      </TagsSelect.Provider>
    </Filter.View>
  );
};

const TagsFilterBar = ({ tagType }: { tagType?: string }) => {
  const [tags, setTags] = useQueryState<string[]>('tags');
  const [open, setOpen] = useState(false);

  if (!tags || !tags.length) {
    return null;
  }

  return (
    <Filter.BarItem queryKey="tags">
      <Filter.BarName>
        <IconTags />
        Tags
      </Filter.BarName>
      <TagsSelect.Provider
        type={tagType || ''}
        value={tags || []}
        mode="multiple"
        onValueChange={(tags) => {
          setTags(tags as string[]);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton
              filterKey="tags"
              className="max-w-72 overflow-hidden justify-start"
            >
              <TagsSelect.SelectedList />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content className="w-72">
            <TagsSelect.Content />
          </Combobox.Content>
        </Popover>
      </TagsSelect.Provider>
    </Filter.BarItem>
  );
};

export const TagsFilter = Object.assign(TagsFilterCommandItem, {
  Bar: TagsFilterBar,
  View: TagsFilterView,
});
