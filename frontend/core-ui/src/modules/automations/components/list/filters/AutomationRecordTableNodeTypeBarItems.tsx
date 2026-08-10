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
    <div className="flex max-w-64 min-w-0 gap-1 overflow-x-auto py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {list
        .filter(({ type }) => selectedTypes.includes(type))
        .map((item) => (
          <Badge
            key={item.type}
            variant="secondary"
            className="max-w-32 min-w-0 flex-none"
            onClose={() =>
              setQueries({
                [queryKey]: queryValue.filter((type) => type !== item.type),
              })
            }
          >
            <span className="min-w-0 truncate">{item.label}</span>
          </Badge>
        ))}
    </div>
  );
};
