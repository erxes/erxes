import {
  CUSTOMER_RELATION_TYPE,
  useBroadcastChooser,
} from '@/broadcast/hooks/useBroadcastChooser';
import { Command, Combobox } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';


export const BroadcastTagChooser = ({
  tags,
  value,
  onChange,
}: {
  tags: any;
  value: string[];
  onChange: (value: string[]) => void;
}) => {
  const { setValue } = useFormContext();

  const { counts, loading } = useBroadcastChooser({
    countTypes: [CUSTOMER_RELATION_TYPE.TAG],
  });

  const tagCounts = counts['tag'] || {};

  return (
    <Command>
      <Command.List className="min-h-full">
        <Combobox.Empty loading={true}></Combobox.Empty>
        {tags.map((tag: any) => {
          if (!tag.children) {
            return (
              <Command.Item
                key={tag._id}
                value={tag._id}
                onSelect={() => {
                  const targetIds = [];

                  if (value?.includes(tag._id)) {
                    targetIds.push(
                      ...(value || []).filter((id: string) => id !== tag._id),
                    );
                  } else {
                    targetIds.push(...(value || []), tag._id);
                  }

                  onChange(targetIds);

                  const targetCount = targetIds.reduce(
                    (sum, id) => sum + (tagCounts[id] || 0),
                    0,
                  );

                  setValue('targetCount', targetCount);
                }}
                className={`mb-1 flex justify-between cursor-pointer ${
                  value?.includes(tag._id) ? 'bg-accent' : ''
                }`}
              >
                <span>{tag.name}</span>
                <span
                  className={`ml-2 text-xs text-muted-foreground ${
                    loading ? 'animate-pulse' : ''
                  }`}
                >
                  {tagCounts[tag._id] || 0}
                </span>
              </Command.Item>
            );
          }

          return (
            <Command.Group heading={tag.name} className="p-0">
              {(tag.children || []).map((child: any) => (
                <Command.Item
                  key={child._id}
                  value={child._id}
                  onSelect={() => {
                    const targetIds = [];

                    if (value?.includes(tag._id)) {
                      targetIds.push(
                        ...(value || []).filter((id: string) => id !== tag._id),
                      );
                    } else {
                      targetIds.push(...(value || []), tag._id);
                    }

                    onChange(targetIds);

                    const targetCount = targetIds.reduce(
                      (sum, id) => sum + (tagCounts[id] || 0),
                      0,
                    );

                    setValue('targetCount', targetCount);
                  }}
                  className={`mb-1 pl-5 flex justify-between cursor-pointer ${
                    value?.includes(child._id) ? 'bg-accent' : ''
                  }`}
                >
                  <span>{child.name}</span>
                  <span
                    className={`ml-2 text-xs text-muted-foreground ${
                      loading ? 'animate-pulse' : ''
                    }`}
                  >
                    {tagCounts[child._id] || 0}
                  </span>
                </Command.Item>
              ))}
            </Command.Group>
          );
        })}
      </Command.List>
    </Command>
  );
};
