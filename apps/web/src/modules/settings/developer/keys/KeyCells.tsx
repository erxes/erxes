import type { ApiKey } from '@erxes/core-contract';
import { Badge, RecordTableInlineCell } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { paths } from '~/lib/paths';
import { useKeyLookups } from './useKeyLookups';
import { useKeyPlugins } from './useKeyPlugins';
import { useKeySentence } from './useKeySentence';

/** The key's name, opening its page. */
export const KeyNameCell = ({ apiKey }: { apiKey: ApiKey }) => (
  <RecordTableInlineCell>
    <Link to={paths.settings.apiKeyOf(apiKey.id)} className="truncate font-medium hover:underline">
      {apiKey.name}
    </Link>
  </RecordTableInlineCell>
);

export const KeyKindCell = ({ kind }: { kind: ApiKey['kind'] }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-keys' });

  const badge =
    kind === 'management' ? (
      <Badge variant="info">{t('kind.management', 'Management')}</Badge>
    ) : kind === 'regular' ? (
      <Badge variant="secondary">{t('kind.regular', 'Regular')}</Badge>
    ) : (
      <Badge variant="warning">{t('kind.member', 'Old key')}</Badge>
    );

  return <RecordTableInlineCell>{badge}</RecordTableInlineCell>;
};

/** What the key can do, in its sentence; a key made before rules says whose rights it has. */
export const KeyAccessCell = ({ apiKey }: { apiKey: ApiKey }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-keys' });
  const sentence = useKeySentence();
  const { nameOf } = useKeyLookups();
  const { titled } = useKeyPlugins();

  const text =
    apiKey.kind === 'member'
      ? t('old-key', 'Made before rules: can do everything {{name}} can.', {
          name: apiKey.memberName ?? apiKey.memberEmail,
        })
      : sentence({
          kind: apiKey.kind,
          areas: apiKey.areas,
          plugins: titled(apiKey.pluginAccess),
          actions: apiKey.actions,
          scope: apiKey.ownRecords ? 'own' : apiKey.unitIds.length ? 'units' : 'all',
          unitNames: apiKey.unitIds.map(nameOf),
          tagNames: apiKey.tagIds.map(nameOf),
          ips: apiKey.allowedIps,
          until: apiKey.expiresAt,
        });

  return (
    <RecordTableInlineCell variant="muted" title={text}>
      <span className="truncate">{text}</span>
    </RecordTableInlineCell>
  );
};
