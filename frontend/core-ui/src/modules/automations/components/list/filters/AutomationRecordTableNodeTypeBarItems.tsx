import { useAutomationRecordTableNodeTypeFilter } from '@/automations/hooks/useAutomationRecordTableNodeTypeFilter';
import { AutomationNodeType } from '@/automations/types';
import { Badge } from 'erxes-ui';

export const AutomationRecordTableNodeTypeBarItems = ({
  nodeType,
  selectedTypes,
}: {
  nodeType: AutomationNodeType.Trigger | AutomationNodeType.Action;
  selectedTypes: string[];
}) => {
  const { list, setQueries, queryKey, queryValue } =
    useAutomationRecordTableNodeTypeFilter(nodeType);
  return (
    <>
      {list
        .filter(({ type }) => selectedTypes.includes(type))
        .map((item) => (
          <Badge
            key={item.type}
            variant="secondary"
            onClose={() =>
              setQueries({
                [queryKey]: queryValue.filter((type) => type !== item.type),
              })
            }
          >
            {item.label}
          </Badge>
        ))}
    </>
  );
};
