import { Button, cn, Popover, Command, useQueryState } from 'erxes-ui';
import { useTagTypes } from 'ui-modules/modules/tags-new/hooks/useTagTypes';
import { IconChevronDown, IconCheck } from '@tabler/icons-react';
import { getTagTypeDescription } from '../utils/getTagTypeDescription';
import { useState } from 'react';

export const TagTypeSelect = () => {
  const [type, setType] = useQueryState<string>('tagType');
  const [open, setOpen] = useState(false);
  const { types } = useTagTypes();

  const handleSelect = (contentType: string) => {
    setType(contentType);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button variant="secondary" size="sm" className="w-fit">
          <span>
            {getTagTypeDescription({ type, tagTypes: types })}
            {' tags'}
          </span>
          <IconChevronDown className="transition-all duration-200" />
        </Button>
      </Popover.Trigger>
      <Popover.Content className="p-0" align="start">
        <Command>
          <Command.Input placeholder="Search tag types..." autoFocus />
          <Command.List>
            <Command.Empty>No tag types found.</Command.Empty>
            {Object.entries(types).map(([key, value]) => (
              <Command.Group
                key={key}
                heading={key === 'core' ? 'Core tags' : `${key} tags`}
                className="capitalize [&>*:first-child]:px-1 [&>*:first-child]:pb-1 [&>*:first-child]:pt-0"
              >
                {value.map((_type) => (
                  <Command.Item
                    key={_type.contentType}
                    value={_type.description}
                    onSelect={() => handleSelect(_type.contentType)}
                    className="cursor-pointer"
                  >
                    <span
                      className={cn(
                        _type.contentType === type &&
                          'text-primary font-medium',
                      )}
                    >
                      {_type.description} tags
                    </span>
                    {_type.contentType === type && (
                      <IconCheck className="ml-auto h-4 w-4 text-primary" />
                    )}
                  </Command.Item>
                ))}
              </Command.Group>
            ))}
          </Command.List>
        </Command>
      </Popover.Content>
    </Popover>
  );
};
