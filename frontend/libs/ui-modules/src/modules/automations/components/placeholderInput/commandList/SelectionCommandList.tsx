import { Collapsible, Combobox, Command, EnumCursorDirection } from 'erxes-ui';
import { useSelectionConfig } from 'ui-modules/modules/automations/hooks/useSelectionConfig';

type SelectionProps = {
  selectionConfig: any;
  onSelect: (value: string) => void;
};

export const SelectionCommandList = ({
  selectionConfig,
  onSelect,
}: SelectionProps) => {
  const { loading, items, totalCount, handleFetchMore } =
    useSelectionConfig(selectionConfig);

  if (!selectionConfig) {
    return null;
  }

  return (
    <Collapsible className="space-y-2">
      <Collapsible.TriggerButton className="px-4">
        <div className="flex items-center gap-2">
          <span>Options</span>
          <Collapsible.TriggerIcon className="h-4 w-4" />
        </div>
      </Collapsible.TriggerButton>
      <Collapsible.Content className="px-4 m-0">
        <Command.Empty>Not found.</Command.Empty>
        <Command.Group value="queryOptions">
          <Combobox.Empty loading={loading} />
          {items.map((option: any) => (
            <Command.Item
              key={option.value}
              value={option.value}
              onSelect={onSelect}
            >
              {option.label}
            </Command.Item>
          ))}
          <Combobox.FetchMore
            currentLength={items?.length}
            totalCount={totalCount}
            fetchMore={() =>
              handleFetchMore({ direction: EnumCursorDirection.FORWARD })
            }
          />
        </Command.Group>
      </Collapsible.Content>
    </Collapsible>
  );
};
