import { useAutomationRecordTableNodeTypeFilter } from '@/automations/hooks/useAutomationRecordTableNodeTypeFilter';
import { AutomationNodeType } from '@/automations/types';
import { IconCheck } from '@tabler/icons-react';
import { Combobox, Command, IconComponent } from 'erxes-ui';

export const AutomationRecordTableNodeTypeFilter = ({
  nodeType,
}: {
  nodeType: AutomationNodeType.Action | AutomationNodeType.Trigger;
}) => {
  const { list, queryValue, loading, error, queryKey, setQueries } =
    useAutomationRecordTableNodeTypeFilter(nodeType);

  return (
    <Command>
      <Command.Input placeholder="Search" focusOnMount />

      <Command.List>
        <Combobox.Empty error={error} loading={loading} />
        {list.map((item) => (
          <Command.Item
            key={item.type}
            value={item.type}
            onSelect={() => {
              setQueries({
                [queryKey]: queryValue.includes(item.type)
                  ? queryValue.filter((type) => type !== item.type)
                  : [...queryValue, item.type],
              });
              console.log(queryValue, item.type, queryKey);
            }}
          >
            {item.icon && <IconComponent name={item.icon} />}
            {item.label}
            {queryValue.includes(item.type) && (
              <IconCheck className="ml-auto" />
            )}
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};
