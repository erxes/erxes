import { Combobox, Command } from 'erxes-ui';
import { useAttributes } from 'ui-modules/modules/automations/hooks/useAttributes';

export const AttributesCommandList = ({
  contentType,
  attributesConfig,
  additionalAttributes,
  attributeTypes,
  onSelect,
}: {
  contentType?: string;
  attributesConfig?: any;
  additionalAttributes?: any[];
  attributeTypes?: string[];
  onSelect: (value: string) => void;
}) => {
  const { groupAttributes, loading } = useAttributes({
    contentType,
    attributesConfig,
    additionalAttributes,
    attributeTypes,
  });

  const groups = Object.entries(groupAttributes || {}).filter(
    ([, attributions]) => ((attributions as any[]) || []).length > 0,
  );

  if (!groups.length) {
    return <Combobox.Empty loading={loading} />;
  }

  return (
    <>
      {groups.map(([key, attributions]) => {
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
                <div className="flex min-w-0 items-center justify-between gap-3">
                  <span className="truncate">{label}</span>
                  <span className="truncate font-mono text-[11px] text-muted-foreground">
                    {name}
                  </span>
                </div>
              </Command.Item>
            ))}
          </Command.Group>
        );
      })}
      <Combobox.Empty loading={loading} />
    </>
  );
};
