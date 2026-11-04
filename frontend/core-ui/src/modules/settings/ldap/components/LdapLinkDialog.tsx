import { useState } from 'react';
import {
  Button,
  Dialog,
  Input,
  Label,
  Spinner,
  toast,
  useQueryState,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useLdapUserLink } from '@/settings/ldap/hooks/useLdapUserLink';

export const LdapLinkDialog = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'ldap' });
  const [userId, setUserId] = useQueryState<string>('ldap_link_id');
  const [identifier, setIdentifier] = useState('');
  const { link, linking } = useLdapUserLink();

  const close = () => {
    setIdentifier('');
    setUserId(null);
  };

  const submit = () => {
    if (!userId || !identifier.trim()) return;

    link({
      variables: { userId, identifier: identifier.trim() },
      onCompleted: () => {
        toast({ title: t('user-linked'), variant: 'success' });
        close();
      },
      onError: (e) => toast({ title: e.message, variant: 'destructive' }),
    });
  };

  return (
    <Dialog open={!!userId} onOpenChange={(open) => !open && close()}>
      <Dialog.Content>
        <Dialog.HeaderCombined
          title={t('link-title')}
          description={t('link-description')}
        />
        <div className="flex flex-col gap-2">
          <Label htmlFor="ldap-link-identifier">{t('directory-user')}</Label>
          <Input
            id="ldap-link-identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder={t('test-identifier-placeholder')}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={close}>
            {t('cancel')}
          </Button>
          <Button
            type="button"
            disabled={linking || !identifier.trim()}
            onClick={submit}
          >
            {linking && <Spinner size="sm" />}
            {t('link')}
          </Button>
        </div>
      </Dialog.Content>
    </Dialog>
  );
};
