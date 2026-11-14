import { IconEye } from '@tabler/icons-react';
import { Alert } from 'erxes-ui';
import type { ReactNode } from 'react';

/**
 * A read-only tab: why it cannot be edited, then its content with every
 * control disabled.
 */
export const PanelReadOnlyTab = ({
  reason,
  children,
}: {
  reason: string | null;
  children: ReactNode;
}) =>
  reason ? (
    <fieldset disabled className="flex min-h-0 min-w-0 flex-1 flex-col">
      <Alert className="m-3 mb-0 w-auto shrink-0 items-center">
        <IconEye />
        <Alert.Description>{reason}</Alert.Description>
      </Alert>
      {children}
    </fieldset>
  ) : (
    children
  );
