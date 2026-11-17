import { API_KEY_AREA_INFO, API_KEY_AREAS, type ApiKeyArea } from '@erxes/core-contract';
import { IconChevronDown, IconCircleCheckFilled, IconCircleX, IconList } from '@tabler/icons-react';
import { Badge, Collapsible, cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { AREA_ICONS } from './AccessRows';

const AREAS = new Set<string>(API_KEY_AREAS);

const isArea = (name: string): name is ApiKeyArea => AREAS.has(name);

/** One call the key could be given, and the server's decision on it. */
export interface CheckRow {
  procedure: string;
  label: string;
  method: string;
  area: string;
  allowed: boolean;
  rule: string;
  reason: string;
}

/** Why a call is refused, in a few words of the key page. */
const useWhy = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-keys.try' });

  return (rule: string) => {
    const [head = '', area = '', access] = rule.split(':');
    const label = isArea(area) ? t(`area.${area}`, API_KEY_AREA_INFO[area].label) : area;

    if (head === 'area') {
      return access === 'read'
        ? t('why-read-only', '{{area}} is read only', { area: label })
        : t('why-off', '{{area}} is off', { area: label });
    }

    const words: Record<string, string> = {
      call: t('why-call', 'Not one of its chosen calls'),
      kind: t('why-kind', 'Not for this kind of key'),
      rows: t('why-rows', 'Outside its contact limits'),
      ip: t('why-ip', 'Not from this address'),
      expired: t('why-expired', 'The key has expired'),
      permission: t('why-maker', "Its maker's role doesn't allow it"),
      role: t('why-maker', "Its maker's role doesn't allow it"),
      maker: t('why-maker', "Its maker's role doesn't allow it"),
    };

    return words[head] ?? t('why-never', 'No key can make this call');
  };
};

const CallRow = ({ row }: { row: CheckRow }) => (
  <li
    data-testid={`call-${row.procedure}`}
    data-allowed={row.allowed}
    title={row.allowed ? undefined : row.reason}
    className="flex items-center gap-3 py-2 pr-4 pl-11 text-sm"
  >
    {row.allowed ? (
      <IconCircleCheckFilled className="size-4 shrink-0 text-success" />
    ) : (
      <IconCircleX className="size-4 shrink-0 text-muted-foreground" />
    )}
    <span className={cn('min-w-0 flex-1', !row.allowed && 'text-muted-foreground')}>
      {row.label}
    </span>
    <span className="w-14 shrink-0 text-right font-mono text-xs text-muted-foreground">
      {row.method}
    </span>
  </li>
);

/** The calls refused for one reason, folded into a single line. */
const RefusedGroup = ({ why, rows, open }: { why: string; rows: CheckRow[]; open: boolean }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-keys.try' });

  return (
    <li>
      <Collapsible defaultOpen={open} className="group/refused">
        <Collapsible.Trigger className="w-full">
          <span className="flex items-center gap-3 py-2 pr-4 pl-11 text-left text-sm text-muted-foreground hover:bg-muted/40">
            <IconCircleX className="size-4 shrink-0" />
            <span className="flex-1">
              {t('refused-group', '{{count}} refused: {{why}}', { count: rows.length, why })}
            </span>
            <IconChevronDown className="size-4 transition-transform group-data-open/refused:rotate-180" />
          </span>
        </Collapsible.Trigger>
        <Collapsible.Panel>
          <ul className="divide-y bg-muted/20">
            {rows.map((row) => (
              <CallRow key={row.procedure} row={row} />
            ))}
          </ul>
        </Collapsible.Panel>
      </Collapsible>
    </li>
  );
};

/**
 * One area: the calls the key may make, then the refused ones folded by reason. Opens by itself
 * when the key may make any of its calls, or while searching.
 */
export const AreaCalls = ({
  area,
  rows,
  searching,
}: {
  area: string;
  rows: CheckRow[];
  searching: boolean;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-keys.try' });
  const why = useWhy();
  const AreaIcon = isArea(area) ? AREA_ICONS[area] : IconList;
  const allowed = rows.filter((row) => row.allowed);

  const refused = new Map<string, CheckRow[]>();

  for (const row of rows) {
    if (!row.allowed) {
      const reason = why(row.rule);

      refused.set(reason, [...(refused.get(reason) ?? []), row]);
    }
  }

  const [only] = refused.size === 1 ? refused.keys() : [];

  return (
    <section
      data-testid={`area-${area}`}
      className="overflow-hidden rounded-lg border bg-background"
    >
      <Collapsible defaultOpen={searching || allowed.length > 0} className="group/area">
        <Collapsible.Trigger className="w-full">
          <span className="flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/40">
            <AreaIcon size={16} className="shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">
                {isArea(area)
                  ? t(`area.${area}`, API_KEY_AREA_INFO[area].label)
                  : t('lookup', 'Lists every key reads')}
              </span>
              {!allowed.length && only && (
                <span className="block text-xs text-muted-foreground">{only}</span>
              )}
            </span>
            <Badge variant={allowed.length ? 'success' : 'muted'}>
              {t('allowed-of', '{{count}} of {{total}} allowed', {
                count: allowed.length,
                total: rows.length,
              })}
            </Badge>
            <IconChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-data-open/area:rotate-180" />
          </span>
        </Collapsible.Trigger>
        <Collapsible.Panel>
          <ul className="divide-y border-t">
            {allowed.map((row) => (
              <CallRow key={row.procedure} row={row} />
            ))}
            {[...refused].map(([reason, group]) => (
              <RefusedGroup key={reason} why={reason} rows={group} open={searching} />
            ))}
          </ul>
        </Collapsible.Panel>
      </Collapsible>
    </section>
  );
};
