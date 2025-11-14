import { IconChevronDown } from '@tabler/icons-react';
import { Button, Collapsible, Combobox, Command, Popover } from 'erxes-ui';
import { useAttributes } from 'ui-modules/modules/automations/hooks/useAttributes';

type Props = {
  contentType: string;
  onSelect: (value: string) => void;
  customAttributions?: any[];
  attrConfig?: any;
  trigger?: React.ReactNode;
  ref?: any;
  buttonText?: string;
};

export const Attributes = ({
  trigger,
  contentType,
  attrConfig,
  customAttributions,
  onSelect,
  ref,
  buttonText,
}: Props) => {
  const handleSelect = (attribute: string) => {
    onSelect(`{{ ${attribute} }}`);
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

          <Command.Empty>Not found.</Command.Empty>
          <Command.List>
            <RenderAttributes
              contentType={contentType}
              attrConfig={attrConfig}
              customAttributions={customAttributions}
              onSelect={handleSelect}
            />
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const RenderAttributes = ({
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
    attributesConfig: attrConfig,
    additionalAttributes: customAttributions,
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
