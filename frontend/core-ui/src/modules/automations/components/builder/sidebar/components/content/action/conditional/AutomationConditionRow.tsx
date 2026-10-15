import { AutomationConditionValueInput } from '@/automations/components/builder/sidebar/components/content/action/conditional/AutomationConditionValueInput';
import {
  CUSTOM_CONDITION_SOURCE,
  SEGMENT_CONDITION_SOURCE,
  useAutomationConditionRow,
} from '@/automations/components/builder/sidebar/hooks/useAutomationConditionRow';
import { IconTrash } from '@tabler/icons-react';
import {
  Button,
  cn,
  Combobox,
  Command,
  Popover,
  Select,
  TPropertyInputMeta,
} from 'erxes-ui';
import {
  PlaceholderInput,
  SelectSegment,
  TAutomationCondition,
} from 'ui-modules';

// Column widths match the segment builder so both read the same way
export const AutomationConditionHeader = () => (
  <div className="flex flex-row gap-2 px-1 pb-1 text-xs uppercase tracking-wide text-muted-foreground">
    <span className="w-[150px] shrink-0">Type</span>
    <span className="min-w-[150px] flex-1">Property</span>
    <span className="w-[150px] shrink-0">Condition</span>
    <span className="flex-1">Value</span>
    <span className="w-9 shrink-0" />
  </div>
);

export const AutomationConditionRow = ({
  condition,
  onChange,
  onRemove,
}: {
  condition: TAutomationCondition;
  onChange: (condition: TAutomationCondition) => void;
  onRemove: () => void;
}) => {
  const {
    sourceNodes,
    typeValue,
    isCustom,
    properties,
    propertiesLoading,
    property,
    operators,
    needsValue,
    setType,
    setProperty,
    setLeft,
    setOperator,
    setValue,
    setValueMeta,
    setSegment,
  } = useAutomationConditionRow({ condition, onChange });

  return (
    <div className="group/row flex flex-row items-start gap-2 py-1">
      <div className="w-[150px] shrink-0">
        <Select value={typeValue} onValueChange={setType}>
          <Select.Trigger className="w-full">
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            {sourceNodes.map((node) => (
              <Select.Item key={node.id} value={node.id}>
                {node.label}
              </Select.Item>
            ))}
            <Select.Separator />
            <Select.Item value={SEGMENT_CONDITION_SOURCE}>Segment</Select.Item>
            <Select.Item value={CUSTOM_CONDITION_SOURCE}>
              Custom value
            </Select.Item>
          </Select.Content>
        </Select>
      </div>

      {condition.kind === 'segment' ? (
        <div className="min-w-0 flex-[2]">
          <SelectSegment selected={condition.segmentId} onSelect={setSegment} />
        </div>
      ) : (
        <>
          <div className="min-w-[150px] flex-1">
            {isCustom ? (
              <PlaceholderInput value={condition.left} onChange={setLeft} />
            ) : (
              <Popover>
                <Combobox.Trigger
                  disabled={propertiesLoading}
                  className="w-full"
                >
                  <Combobox.Value
                    placeholder="Select a property"
                    value={property?.label}
                  />
                </Combobox.Trigger>
                <Combobox.Content>
                  <Command>
                    <Command.Input placeholder="Search properties" />
                    <Command.List className="max-h-64">
                      <Command.Empty>No property found</Command.Empty>
                      {properties.map((option) => (
                        <Command.Item
                          key={option.token}
                          value={option.label}
                          onSelect={() => setProperty(option.token)}
                        >
                          {option.label}
                        </Command.Item>
                      ))}
                    </Command.List>
                  </Command>
                </Combobox.Content>
              </Popover>
            )}
          </div>
          <div className="w-[150px] shrink-0">
            <Select value={condition.operator} onValueChange={setOperator}>
              <Select.Trigger className="w-full">
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                {operators.map(({ value, label }) => (
                  <Select.Item key={value} value={value}>
                    {label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
          <div className="min-w-0 flex-1">
            {needsValue && (
              <AutomationConditionValueInput
                property={property}
                value={condition.right ?? ''}
                meta={condition.meta?.inputMeta as TPropertyInputMeta}
                onChange={setValue}
                onMetaChange={setValueMeta}
              />
            )}
          </div>
        </>
      )}

      <Button
        type="button"
        variant="ghost"
        size="icon"
        title="Remove condition"
        className={cn(
          'shrink-0 text-destructive opacity-0 transition-opacity group-hover/row:opacity-100',
        )}
        onClick={onRemove}
      >
        <IconTrash />
      </Button>
    </div>
  );
};
