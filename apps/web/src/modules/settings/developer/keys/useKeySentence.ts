import { API_KEY_AREA_INFO, type ApiKeyAccess, type ApiKeyAreas } from '@erxes/core-contract';
import { useFormat } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { areasOf, type ContactScope, type KeyKind } from './keyDraft';

export interface SentenceInput {
  kind: KeyKind;
  areas: ApiKeyAreas;
  /** The plugins it opens, under their titles. */
  plugins: { title: string; access: ApiKeyAccess }[];
  scope: ContactScope;
  unitNames: string[];
  tagNames: string[];
  ips: string[];
  /** When it stops working; null until it is revoked. */
  until: Date | string | null;
}

/**
 * What a key can do, in one plain sentence: "Reads and writes contacts, reads products, only
 * contacts in North, from any address, until 1 Mar 2027."
 */
export const useKeySentence = () => {
  const { t, i18n } = useTranslation('settings', { keyPrefix: 'api-keys.sentence' });
  const fmt = useFormat();

  const list = (items: string[], type: 'conjunction' | 'disjunction' = 'conjunction') =>
    new Intl.ListFormat(i18n.language, { type }).format(items);

  return (input: SentenceInput) => {
    const opened = areasOf(input.kind).filter((area) => input.areas[area]);

    const nouns = (access: ApiKeyAccess) => [
      ...opened
        .filter((area) => input.areas[area] === access)
        .map((area) => t(`area.${area}`, API_KEY_AREA_INFO[area].label.toLowerCase())),
      ...input.plugins.filter((plugin) => plugin.access === access).map((plugin) => plugin.title),
    ];

    if (!opened.length && !input.plugins.length) {
      return t('nothing', 'Opens nothing yet: choose what it may use.');
    }

    const writes = nouns('write');
    const reads = nouns('read');

    const parts = [
      writes.length && t('writes', 'Reads and writes {{areas}}', { areas: list(writes) }),
      reads.length &&
        (writes.length
          ? t('reads-too', 'reads {{areas}}', { areas: list(reads) })
          : t('reads', 'Reads {{areas}}', { areas: list(reads) })),
    ].filter((part): part is string => Boolean(part));

    if (input.kind === 'regular' && input.areas.contacts) {
      if (input.scope === 'own') parts.push(t('own', 'only your own contacts'));

      if (input.scope === 'units' && input.unitNames.length) {
        parts.push(t('units', 'only contacts in {{units}}', { units: list(input.unitNames) }));
      }

      if (input.tagNames.length) {
        parts.push(
          t('tags', 'only contacts tagged {{tags}}', {
            tags: list(input.tagNames, 'disjunction'),
          }),
        );
      }
    }

    parts.push(
      input.ips.length
        ? t('ips', 'only from {{ips}}', { ips: list(input.ips, 'disjunction') })
        : t('any-ip', 'from any address'),
      input.until
        ? t('until', 'until {{date}}', { date: fmt.date(input.until) })
        : t('forever', 'until you revoke it'),
    );

    const sentence = `${parts.join(', ')}.`;

    return input.kind === 'management'
      ? `${sentence} ${t('no-contacts', 'It never sees customers or companies.')}`
      : sentence;
  };
};
