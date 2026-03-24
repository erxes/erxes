import { useState } from 'react';
import { useAtomValue } from 'jotai';
import { useQuery } from '@apollo/client';
import { Combobox, Command, Popover, Badge } from 'erxes-ui';
import { IconX } from '@tabler/icons-react';
import { ticketConfigAtom } from '../../../states';
import { GET_WIDGET_TAGS } from '../../graphql/queries';

interface Tag {
  _id: string;
  name: string;
  type?: string;
  description?: string;
}

interface SelectTicketTagProps {
  value?: string[];
  onValueChange?: (value: string[]) => void;
  mode?: 'single' | 'multiple';
  placeholder?: string;
  parentId?: string;
}

export function SelectTicketTag({
  value = [],
  onValueChange,
  mode = 'multiple',
  placeholder = 'Select tags...',
  parentId,
}: SelectTicketTagProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ticketConfig = useAtomValue(ticketConfigAtom);
  const configId = ticketConfig?._id;

  const { data, loading } = useQuery<{ widgetsGetTicketTags: Tag[] }>(
    GET_WIDGET_TAGS,
    {
      variables: { configId, parentId },
      skip: !configId,
    },
  );

  const tags = data?.widgetsGetTicketTags || [];
  const selectedTagIds = Array.isArray(value) ? value : [value].filter(Boolean);
  const selectedTags = tags.filter((tag) => selectedTagIds.includes(tag._id));

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelect = (tag: Tag) => {
    if (!onValueChange) return;

    const isSelected = selectedTagIds.includes(tag._id);
    const isSingleMode = mode === 'single';

    if (isSingleMode) {
      onValueChange([tag._id]);
      setOpen(false);
    } else {
      const newValue = isSelected
        ? selectedTagIds.filter((id) => id !== tag._id)
        : [...selectedTagIds, tag._id];
      onValueChange(newValue);
    }
  };

  const handleRemove = (tagId: string) => {
    if (!onValueChange) return;
    onValueChange(selectedTagIds.filter((id) => id !== tagId));
  };

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <Combobox.Trigger>
          <Combobox.Value
            placeholder={placeholder}
            value={
              selectedTags.length > 0
                ? mode === 'single'
                  ? selectedTags[0]?.name
                  : `${selectedTags.length} tag${
                      selectedTags.length > 1 ? 's' : ''
                    } selected`
                : undefined
            }
          />
        </Combobox.Trigger>
        <Combobox.Content className="w-80">
          <Command shouldFilter={false}>
            <Command.Input
              placeholder="Search tags..."
              value={search}
              onValueChange={setSearch}
              focusOnMount
            />
            <Command.List>
              {loading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Loading...
                </div>
              ) : filteredTags.length === 0 ? (
                <Command.Empty>No tags found.</Command.Empty>
              ) : (
                filteredTags.map((tag) => {
                  const isSelected = selectedTagIds.includes(tag._id);
                  return (
                    <Command.Item
                      key={tag._id}
                      onSelect={() => handleSelect(tag)}
                      className="flex items-center justify-between"
                    >
                      <span className="flex-1">{tag.name}</span>
                      <Combobox.Check checked={isSelected} />
                    </Command.Item>
                  );
                })
              )}
            </Command.List>
          </Command>
        </Combobox.Content>
      </Popover>

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedTags.map((tag) => (
            <Badge
              key={tag._id}
              variant="secondary"
              className="text-xs px-2 py-1 flex items-center gap-1"
            >
              {tag.name}
              {mode === 'multiple' && (
                <button
                  type="button"
                  onClick={() => handleRemove(tag._id)}
                  className="ml-1 hover:bg-secondary rounded-full p-0.5"
                >
                  <IconX className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
