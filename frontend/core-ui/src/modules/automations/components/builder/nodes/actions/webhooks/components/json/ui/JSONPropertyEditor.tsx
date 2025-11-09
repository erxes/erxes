import { Input, Select } from 'erxes-ui';
import { PlaceholderInput } from 'ui-modules';

interface JSONPropertyEditorProps {
  type: string;
  value: any;
  onApply: (value: any) => void;
}

export function JSONPropertyEditor({
  type,
  value,
  onApply,
}: JSONPropertyEditorProps) {
  if (type === 'string' || type === 'expression') {
    return (
      <PlaceholderInput
        propertyType="core:automation"
        value={value ?? ''}
        onChange={onApply}
        enabled={{
          attribute: true,
        }}
      />
    );
  }

  if (type === 'number') {
    return (
      <Input
        type="number"
        value={value ?? 0}
        onChange={(e) => onApply(Number(e.target.value))}
        className="font-mono"
      />
    );
  }

  if (type === 'boolean') {
    return (
      <Select
        value={String(!!value)}
        onValueChange={(v) => onApply(v === 'true')}
      >
        <Select.Trigger className="w-28">
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="true">true</Select.Item>
          <Select.Item value="false">false</Select.Item>
        </Select.Content>
      </Select>
    );
  }

  if (type === 'null') {
    return <div className="text-xs text-muted-foreground">null</div>;
  }

  return null;
}
