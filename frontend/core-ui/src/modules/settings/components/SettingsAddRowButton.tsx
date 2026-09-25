import { IconPlus } from '@tabler/icons-react';
import {
  Button,
  Kbd,
  usePreviousHotkeyScope,
  useScopedHotkeys,
} from 'erxes-ui';

export const SettingsAddRowButton = ({
  label,
  onAdd,
  pageScope,
  formRowScope,
  disabled,
  dependencies,
}: {
  label: string;
  onAdd: () => void;
  pageScope: string;
  formRowScope: string;
  disabled?: boolean;
  dependencies?: unknown[];
}) => {
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();
  useScopedHotkeys(
    'c',
    () => {
      onAdd();
      setHotkeyScopeAndMemorizePreviousScope(formRowScope);
    },
    pageScope,
    dependencies,
  );
  return (
    <Button disabled={disabled} onClick={onAdd}>
      <IconPlus className="size-4" />
      {label}
      <Kbd>C</Kbd>
    </Button>
  );
};
