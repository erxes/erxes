import { RecordTableInlineCell, Switch } from 'erxes-ui';

export const LoyaltyStatusSwitchCell = ({
  checked,
  onToggle,
}: {
  checked: boolean;
  onToggle: () => void;
}) => (
  <RecordTableInlineCell>
    <Switch className="mx-auto" checked={checked} onCheckedChange={onToggle} />
  </RecordTableInlineCell>
);
