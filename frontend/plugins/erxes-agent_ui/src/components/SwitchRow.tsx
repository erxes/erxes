import { Label, Switch } from 'erxes-ui';

// Labeled toggle row shared by the plugin's forms: a left-aligned label with an
// optional hint and a right-aligned Switch.
export const SwitchRow = ({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => (
  <div className="flex items-center justify-between gap-4">
    <div>
      <Label className="font-medium">{label}</Label>
      {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
    </div>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);
