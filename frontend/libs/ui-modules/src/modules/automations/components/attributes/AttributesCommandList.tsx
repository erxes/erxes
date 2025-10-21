import { Combobox, Command } from 'erxes-ui';
import { useAttributes } from 'ui-modules/modules/automations/hooks/useAttributes';

export const AttributesCommandList = ({
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
