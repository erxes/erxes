import {
  Button,
  cn,
  Popover,
  Command,
  useQueryState,
  PopoverScoped,
} from 'erxes-ui';
import { useTagTypes } from 'ui-modules/modules/tags-new/hooks/useTagTypes';
import { IconChevronDown, IconCheck } from '@tabler/icons-react';
import { getTagTypeDescription } from '../utils/getTagTypeDescription';
import { useState } from 'react';

export const TagTypeSelect = ({
  scope,
  ...props
}: {
  scope?: string;
} & React.ComponentProps<typeof Button>) => {
  const [type, setType] = useQueryState<string>('tagType');
  const [open, setOpen] = useState(false);
  const { types } = useTagTypes();

  const handleSelect = (contentType: string | null) => {
    setType(contentType);
    setOpen(false);
  };

  return (
    <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className={cn('w-fit text-muted-foreground')}
          {...props}
        >
          <div className="flex items-center gap-2 ">
            {getTagTypeDescription({ type, tagTypes: types })}
            {' tags'}
          </div>
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
                {key === 'core' && (
                  <Command.Item
                    onSelect={() => handleSelect(null)}
                    className="cursor-pointer"
                  >
                    <span
                      className={cn(
                        type === null && 'text-primary font-medium',
                      )}
                    >
                      {'Workspace tags'}
                    </span>
                    {type === null && (
                      <IconCheck className="ml-auto h-4 w-4 text-primary" />
                    )}
                  </Command.Item>
                )}
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
    </PopoverScoped>
  );
};
