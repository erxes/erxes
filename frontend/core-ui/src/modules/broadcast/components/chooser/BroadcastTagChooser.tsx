import { IconTag } from '@tabler/icons-react';
import { cn, Command } from 'erxes-ui';
import { useBroadcastTagSelection } from '../../hooks/useBroadcastTagSelection';
import { BroadcastTargetEmpty } from '../steps/BroadcastTargetEmpty';

export const BroadcastTagChooser = ({
  value,
  onChange,
}: {
  value: string[];
  onChange: (value: string[]) => void;
}) => {
  const {
    options,
    loading,
    countOf,
    isSelected,
    toggle,
    toggleGroup,
    groupCount,
    hasSelectedChild,
  } = useBroadcastTagSelection({ value, onChange });

  const count = (value: number) => (
    <span
      className={cn(
        'shrink-0 text-xs tabular-nums text-muted-foreground',
        loading && 'animate-pulse',
      )}
    >
      {value}
    </span>
  );

  if (!loading && !options.length) {
    return (
      <BroadcastTargetEmpty
        icon={IconTag}
        titleKey="target.no-tags"
        descriptionKey="target.no-tags-body"
        actionKey="target.create-tag"
        to="/settings/tags?tagType=core:customer"
      />
    );
  }

  return (
    <Command className="h-auto min-h-0 min-w-0 flex-1 border">
      <Command.List className="m-0 min-h-0 max-h-none flex-1 overflow-x-hidden overflow-y-auto p-1">
        {options.map((tag) =>
          !tag.children ? (
            <Command.Item
              key={tag._id}
              value={tag._id}
              onSelect={() => toggle(tag._id)}
              className={cn(
                'mb-1 min-w-0 justify-between cursor-pointer last-of-type:mb-0',
                isSelected(tag._id) &&
                  'bg-primary/10 data-[selected=true]:bg-primary/10',
              )}
            >
              <span className="min-w-0 flex-1 truncate" title={tag.name}>
                {tag.name}
              </span>
              {count(countOf(tag._id))}
            </Command.Item>
          ) : (
            <Command.Group
              key={tag._id}
              heading={
                <span
                  className="flex min-w-0 w-full cursor-pointer items-center justify-between gap-2 hover:text-primary"
                  onClick={() => toggleGroup(tag)}
                >
                  <span className="min-w-0 flex-1 truncate" title={tag.name}>
                    {tag.name}
                  </span>
                  {hasSelectedChild(tag) && count(groupCount(tag))}
                </span>
              }
              className="p-0"
            >
              {tag.children.map((child) => (
                <Command.Item
                  key={child._id}
                  value={child._id}
                  onSelect={() => toggle(child._id)}
                  className={cn(
                    'mb-1 min-w-0 pl-5 justify-between cursor-pointer last-of-type:mb-0',
                    isSelected(child._id) &&
                      'bg-primary/10 data-[selected=true]:bg-primary/10',
                  )}
                >
                  <span className="min-w-0 flex-1 truncate" title={child.name}>
                    {child.name}
                  </span>
                  {count(countOf(child._id))}
                </Command.Item>
              ))}
            </Command.Group>
          ),
        )}
      </Command.List>
    </Command>
  );
};
