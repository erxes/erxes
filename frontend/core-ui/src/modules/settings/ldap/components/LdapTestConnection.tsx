import { useState } from 'react';
import { Badge, Button, Input, Label, Spinner } from 'erxes-ui';
import { IconPlugConnected } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { ILdapTestResult } from '@/settings/ldap/types';

export const LdapTestConnection = ({
  onTest,
  result,
  testing,
}: {
  onTest: (identifier: string) => void;
  result: ILdapTestResult | null;
  testing: boolean;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'ldap' });
  const [identifier, setIdentifier] = useState('');

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">
      <div>
        <Label>{t('test-connection')}</Label>
        <p className="text-sm text-muted-foreground">
          {t('test-connection-description')}
        </p>
      </div>
      <div className="flex gap-2">
        <Input
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder={t('test-identifier-placeholder')}
        />
        <Button
          type="button"
          variant="secondary"
          disabled={testing}
          onClick={() => onTest(identifier)}
        >
          {testing ? <Spinner size="sm" /> : <IconPlugConnected />}
          {t('test')}
        </Button>
      </div>
      {result && (
        <div className="flex flex-col gap-2 text-sm">
          <Badge
            variant={result.ok ? 'success' : 'destructive'}
            className="self-start"
          >
            {result.message}
          </Badge>
          {result.profile && (
            <dl className="grid grid-cols-[8rem_1fr] gap-x-3 gap-y-1">
              <dt className="text-muted-foreground">DN</dt>
              <dd className="break-all">{result.profile.dn}</dd>
              <dt className="text-muted-foreground">{t('email')}</dt>
              <dd>{result.profile.email || '—'}</dd>
              <dt className="text-muted-foreground">{t('name')}</dt>
              <dd>
                {[result.profile.firstName, result.profile.lastName]
                  .filter(Boolean)
                  .join(' ') || '—'}
              </dd>
              <dt className="text-muted-foreground">{t('groups')}</dt>
              <dd className="flex flex-col gap-0.5 break-all">
                {result.profile.groupDns.length
                  ? result.profile.groupDns.map((dn) => <span key={dn}>{dn}</span>)
                  : '—'}
              </dd>
            </dl>
          )}
        </div>
      )}
    </div>
  );
};
