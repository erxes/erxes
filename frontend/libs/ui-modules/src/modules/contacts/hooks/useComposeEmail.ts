import { useAtomValue } from 'jotai';
import { pluginsConfigState } from 'ui-modules/states';
import { usePermissionCheck } from 'ui-modules/modules/permissions';

export interface ComposeEmailRequest {
  email?: string;
  customerId?: string;
  companyId?: string;
  integrationId?: string;
}

export const useComposeEmail = () => {
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
