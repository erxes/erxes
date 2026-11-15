import { IconEye } from '@tabler/icons-react';
import { Alert } from 'erxes-ui';
import type { ReactNode } from 'react';

/**
 * An editable tab's content. Read-only (`reason`) it says why and every
 * control is disabled; `disabled` alone holds the controls while a save or
 * create is pending. The wrapper is always drawn, so neither remounts the
 * content.
 */
export const PanelReadOnlyTab = ({
  reason,
  disabled = false,
  children,
}: {
  reason: string | null;
  disabled?: boolean;
  children: ReactNode;
}) => (
  <fieldset
    disabled={!!reason || disabled}
    className="flex min-h-0 min-w-0 flex-1 flex-col"
  >
    {reason && (
      <Alert className="m-3 mb-0 w-auto shrink-0 items-center">
        <IconEye />
        <Alert.Description>{reason}</Alert.Description>
      </Alert>
    )}
    {children}
  </fieldset>
);
