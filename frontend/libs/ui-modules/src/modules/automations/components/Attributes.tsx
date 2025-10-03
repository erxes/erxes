import { IconChevronDown } from '@tabler/icons-react';
import {
  Button,
  Collapsible,
  Combobox,
  Command,
  EnumCursorDirection,
  Popover,
} from 'erxes-ui';
import { useAttributes } from 'ui-modules/modules/automations/hooks/useAttributes';
import { useSelectionConfig } from 'ui-modules/modules/automations/hooks/useSelectionConfig';
import { IField } from 'ui-modules/modules/segments';

type Props = {
  value: string;

  contentType: string;
  selectedField?: IField;
  onSelect: (value: string) => void;
  customAttributions?: any[];
  attrConfig?: any;
  onlySet?: boolean;
  trigger?: React.ReactNode;
  ref?: any;
  buttonText?: string;
  isForSelectField?: boolean;
};

type SelectionProps = {
  selectionConfig: any;
  onSelect: (value: string) => void;
};

export const Attributes = ({
  trigger,
  selectedField,
  contentType,
  attrConfig,
  customAttributions,
  onSelect,
  onlySet,
  ref,
  buttonText,
  value,
  isForSelectField,
}: Props) => {
  const { selectOptions = [], selectionConfig } = selectedField || {};

  const getComma = (preValue: any) => {
    if (isForSelectField && preValue) {
      return ', ';
    }

    if (preValue) {
      return ' ';
    }

    return '';
  };

  const handleSelect = (attribute: string) => {
    if (onlySet) {
      value = `{{ ${attribute} }}`;
    } else {
      value = `${value || ''}${getComma(value)}{{ ${attribute} }}`;
    }
    onSelect(value);
  };

  return (
    <Popover>
      <Combobox.TriggerBase
        variant="link"
        size="sm"
        className="text-primary w-26 border-0"
        asChild
      >
        {trigger || (
          <Button variant="link">
            {buttonText} <IconChevronDown />
          </Button>
        )}
      </Combobox.TriggerBase>
      <Combobox.Content>
        <Command ref={ref}>
          <Command.Input placeholder="Search ..." />

          <Command.List>
            <Collapsible className="space-y-2">
              <Collapsible.TriggerButton className="px-4">
                <div className="flex items-center gap-2">
                  <span>Attributes</span>
                  <Collapsible.TriggerIcon className="h-4 w-4" />
                </div>
              </Collapsible.TriggerButton>
              <Collapsible.Content className="px-4 m-0">
                <Command.Empty>Not found.</Command.Empty>
                <RenderAttributes
                  contentType={contentType}
                  attrConfig={attrConfig}
                  customAttributions={customAttributions}
                  onSelect={handleSelect}
                />
              </Collapsible.Content>
            </Collapsible>

            <RenderOptions selectOptions={selectOptions} />
            <RenderSelection
              selectionConfig={selectionConfig}
              onSelect={onSelect}
            />
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

const RenderAttributes = ({
  contentType,
  attrConfig,
  customAttributions,
  onSelect,
}: {
  contentType: string;
  attrConfig: any;
  customAttributions?: any[];
  onSelect: (value: string) => void;
}) => {
  const { groupAttributes, loading } = useAttributes({
    contentType,
    attrConfig,
    customAttributions,
  });

  return Object.entries(groupAttributes || {}).map(([key, attributions]) => {
    let groupName = key;
    const groupDetail = (groupAttributes[key] || []).find(
      ({ group }: any) => group === key,
    )?.groupDetail;

    if (groupDetail) {
      groupName = groupDetail?.name || key;
    }
    return (
      <Command.Group key={key} value={key} heading={groupName}>
        {((attributions as any[]) || []).map(({ name, label }: any) => (
          <Command.Item key={name} value={name} onSelect={onSelect}>
            {label}
          </Command.Item>
        ))}
        <Combobox.Empty loading={loading} />
      </Command.Group>
    );
  });
};

const RenderSelection = ({ selectionConfig, onSelect }: SelectionProps) => {
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

const RenderOptions = ({ selectOptions }: { selectOptions: any[] }) => {
  if (!selectOptions?.length) {
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
        <Command.Group value="options">
          {selectOptions.map((option: any) => (
            <Command.Item
              key={String(option.value)}
              value={String(option.value)}
            >
              {option.label || '-'}
            </Command.Item>
          ))}
        </Command.Group>
      </Collapsible.Content>
    </Collapsible>
  );
};
