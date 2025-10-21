import { IconChevronDown } from '@tabler/icons-react';
import { Button, Collapsible, Combobox, Command, Popover } from 'erxes-ui';
import { AttributesCommandList } from 'ui-modules/modules/automations/components/attributes/AttributesCommandList';
import { OptionsCommandList } from 'ui-modules/modules/automations/components/attributes/OptionsCommandList';
import { SelectionCommandList } from 'ui-modules/modules/automations/components/attributes/SelectionCommandList';
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
      <Popover.Trigger
        // className="text-primary w-26 border-0"
        asChild
      >
        {trigger || (
          <Button variant="link">
            {buttonText} <IconChevronDown />
          </Button>
        )}
      </Popover.Trigger>
      <Popover.Content className="p-0">
        <Command ref={ref}>
          <Command.Input placeholder="Search ..." />

          <Command.List>
            <Collapsible className="space-y-2">
              <Collapsible.TriggerButton className="px-4">
                <div className="flex items-center gap-2">
                  <span>Attributes</span>
                  <Collapsible.TriggerIcon className="size-4" />
                </div>
              </Collapsible.TriggerButton>
              <Collapsible.Content className="px-4 m-0">
                <Command.Empty>Not found.</Command.Empty>
                <AttributesCommandList
                  contentType={contentType}
                  attrConfig={attrConfig}
                  customAttributions={customAttributions}
                  onSelect={handleSelect}
                />
              </Collapsible.Content>
            </Collapsible>

            <OptionsCommandList selectOptions={selectOptions} />
            <SelectionCommandList
              selectionConfig={selectionConfig}
              onSelect={onSelect}
            />
          </Command.List>
        </Command>
      </Popover.Content>
    </Popover>
  );
};
