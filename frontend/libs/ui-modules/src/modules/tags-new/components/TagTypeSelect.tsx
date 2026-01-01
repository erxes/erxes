import { pluginsConfigState } from 'ui-modules/states';
import {
  Button,
  cn,
  Combobox,
  Command,
  Popover,
  useQueryState,
} from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useGetTagsTypes } from 'ui-modules/modules/tags-new/hooks/useGetTagTypes';
import { useState } from 'react';

export const TagTypeSelect = () => {
  const [tagType, setTagType] = useQueryState<string>('tagType');
  const [open, setOpen] = useState(false);
  const pluginsConfig = useAtomValue(pluginsConfigState);
  const { types, loading } = useGetTagsTypes();
  console.log(pluginsConfig, 'a');
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button variant="secondary" size="sm" className="w-fit">
          {types.length
            ? types.find((type) => type.contentType === tagType)?.description
            : 'All'}
          {' tags'}
        </Button>
      </Popover.Trigger>
      <Combobox.Content className="min-w-60 w-min">
        <Command>
          <Command.Input placeholder="Search..." />
          <Command.List>
            <Combobox.Empty loading={loading} />
            {types && (
              <Command.Group className="p-0">
                {[{ contentType: null, description: 'All' }, ...types].map(
                  (type) => (
                    <Command.Item
                      key={type.contentType}
                      className={cn(
                        tagType === type.contentType && 'text-primary',
                      )}
                      onSelect={() => {
                        setTagType(type.contentType);
                        setOpen(false);
                      }}
                    >
                      {type.description} {' tags'}
                    </Command.Item>
                  ),
                )}
              </Command.Group>
            )}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};
