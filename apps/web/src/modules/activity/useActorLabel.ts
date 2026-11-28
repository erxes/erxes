import type { ActorType } from '@erxes/core-contract';
import { type Member, memberName } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { usePluginTitle } from '~/modules/plugins/pluginText';

/**
 * Who did it, in the member's language: a team member by id (`user`), a plugin by its title as
 * the plugin translates it, a customer, or erxes itself.
 */
export const useActorLabel = () => {
  const { t } = useTranslation('common', { keyPrefix: 'actor' });
  const pluginTitle = usePluginTitle();

  return (
    type: ActorType,
    id: string | null,
    members: Map<string, Member>,
    unknownMember = t('member', 'A team member'),
  ) => {
    if (type === 'user') {
      const member = id ? members.get(id) : undefined;

      return member ? memberName(member) : unknownMember;
    }

    if (type === 'plugin') return id ? pluginTitle(id) : t('plugin', 'A plugin');

    if (type === 'customer') return t('customer', 'A customer');

    return 'erxes';
  };
};
