import { Command, toast, useQueryState } from 'erxes-ui';
import { IconLink, IconLinkOff } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import {
  useLdapLinkedUserIds,
  useLdapUserLink,
} from '@/settings/ldap/hooks/useLdapUserLink';

export const LdapMemberMenuItem = ({
  userId,
  onDone,
}: {
  userId: string;
  onDone: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'ldap' });
  const { canManage, isLinked } = useLdapLinkedUserIds();
  const { unlink } = useLdapUserLink();
  const [, setLinkUserId] = useQueryState<string>('ldap_link_id');

  if (!canManage) return null;

  if (isLinked(userId)) {
    return (
      <Command.Item
        value="ldap-unlink"
        onSelect={() =>
          unlink({
            variables: { userId },
            onCompleted: () => {
              toast({ title: t('user-unlinked'), variant: 'success' });
              onDone();
            },
            onError: (e) => toast({ title: e.message, variant: 'destructive' }),
          })
        }
      >
        <IconLinkOff /> {t('unlink-directory')}
      </Command.Item>
    );
  }

  return (
    <Command.Item
      value="ldap-link"
      onSelect={() => {
        setLinkUserId(userId);
        onDone();
      }}
    >
      <IconLink /> {t('link-directory')}
    </Command.Item>
  );
};
