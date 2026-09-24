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
        'ml-2 text-xs text-muted-foreground',
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
    <Command>
      <Command.List className="min-h-full">
        {options.map((tag) =>
          !tag.children ? (
            <Command.Item
              key={tag._id}
              value={tag._id}
              onSelect={() => toggle(tag._id)}
              className={cn(
                'mb-1 flex justify-between cursor-pointer last-of-type:mb-9',
                isSelected(tag._id) &&
                  'bg-primary/10 data-[selected=true]:bg-primary/10',
              )}
            >
              <span>{tag.name}</span>
              {count(countOf(tag._id))}
            </Command.Item>
          ) : (
            <Command.Group
              key={tag._id}
              heading={
                <span
                  className="cursor-pointer hover:text-primary flex justify-between w-full"
                  onClick={() => toggleGroup(tag)}
                >
                  <span>{tag.name}</span>
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
                    'mb-1 pl-5 flex justify-between cursor-pointer',
                    isSelected(child._id) &&
                      'bg-primary/10 data-[selected=true]:bg-primary/10',
                  )}
                >
                  <span>{child.name}</span>
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
