import { IconSearch } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { InputGroup, PageSubHeader, Select } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { messageOf, orpc } from '~/lib/api';
import { memberName, pluginLabel } from '~/lib/members';
import { usePlugins } from '~/modules/plugins/usePlugins';
import { AREAS, type Filters } from './auditFilters';

/** Every team member, any status: removed members' entries stay in the log. */
const ActorSelect = ({ value, onChange }: { value: string; onChange: (id: string) => void }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'audit-log' });
  const team = useQuery(orpc.users.list.queryOptions({ input: { limit: 100 } }));

  return (
    <Select value={value} onValueChange={onChange}>
      <Select.Trigger className="h-7 w-44" aria-label={t('who', 'Who')}>
        <Select.Value />
      </Select.Trigger>
      <Select.Content>
        <Select.Item value="all">{t('anyone', 'Anyone')}</Select.Item>
        {(team.data?.data ?? []).map((member) => (
          <Select.Item key={member.id} value={member.id}>
            {memberName(member)}
          </Select.Item>
        ))}
        {team.error && (
          <p role="alert" className="px-2 py-1.5 text-xs text-destructive">
            {messageOf(team.error)}
          </p>
        )}
      </Select.Content>
    </Select>
  );
};

/** Search, area, source, who, dates and IP; `total` on the right. */
export const AuditFilterBar = ({
  filters,
  onChange,
  total,
}: {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  total: ReactNode;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'audit-log' });
  const { plugins } = usePlugins();
  const sources = ['core', ...new Set(plugins.map((plugin) => plugin.config.name.toLowerCase()))];

  return (
    <PageSubHeader className="flex-wrap items-center">
      <InputGroup className="w-56">
        <InputGroup.Addon>
          <IconSearch className="size-4" />
        </InputGroup.Addon>
        <InputGroup.Input
          value={filters.q}
          onChange={(event) => onChange({ q: event.target.value })}
          placeholder={t('search', 'Search actions and records')}
          aria-label={t('search', 'Search actions and records')}
        />
      </InputGroup>
      <Select value={filters.area} onValueChange={(area) => onChange({ area })}>
        <Select.Trigger className="h-7 w-36" aria-label={t('area', 'Area')}>
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          {AREAS.map((item) => (
            <Select.Item key={item.value} value={item.value}>
              {t(`areas.${item.value.replace(/[.*]/g, '')}`, item.label)}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
      <Select value={filters.source} onValueChange={(source) => onChange({ source })}>
        <Select.Trigger className="h-7 w-32" aria-label={t('source', 'Source')}>
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="all">{t('all-sources', 'All sources')}</Select.Item>
          {sources.map((source) => (
            <Select.Item key={source} value={source}>
              {source === 'core' ? 'erxes' : pluginLabel(source)}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
      <ActorSelect value={filters.actorId} onChange={(actorId) => onChange({ actorId })} />
      <Input
        type="date"
        value={filters.from}
        onChange={(event) => onChange({ from: event.target.value })}
        className="h-7 w-36"
        aria-label={t('from', 'From')}
      />
      <span className="text-muted-foreground">–</span>
      <Input
        type="date"
        value={filters.to}
        onChange={(event) => onChange({ to: event.target.value })}
        className="h-7 w-36"
        aria-label={t('to', 'To')}
      />
      <Input
        value={filters.ip}
        onChange={(event) => onChange({ ip: event.target.value })}
        placeholder="IP"
        aria-label="IP"
        className="h-7 w-32"
      />
      <span className="ml-auto text-sm text-muted-foreground">{total}</span>
    </PageSubHeader>
  );
};