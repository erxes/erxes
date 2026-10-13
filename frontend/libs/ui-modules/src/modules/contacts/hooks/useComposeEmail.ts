import { useAtomValue } from 'jotai';
import type {
  ComposeEmailActions,
  ComposeEmailRequest,
} from 'ui-modules/modules/contacts/types/contactEmails';
import { usePermissionCheck } from 'ui-modules/modules/permissions';
import { pluginsConfigState } from 'ui-modules/states';

export type { ComposeEmailRequest } from 'ui-modules/modules/contacts/types/contactEmails';

export const useComposeEmail = (): ComposeEmailActions => {
  const plugins = useAtomValue(pluginsConfigState);
  const { isLoaded, hasActionPermission } = usePermissionCheck();
  const canComposeEmail =
    isLoaded &&
    Object.values(plugins || {}).some(
      (plugin) => plugin.name === 'frontline' && plugin.hasFloatingWidget,
    ) &&
    hasActionPermission('conversationMessageAdd');

  const composeEmail = (target: ComposeEmailRequest = {}) => {
    if (!canComposeEmail) return;
    window.dispatchEvent(
      new CustomEvent('frontline:compose-email', { detail: target }),
    );
  };

  return { canComposeEmail, composeEmail };
};
