import type { Broadcast, ConditionGroup, View } from '@erxes/core-contract';
import { memberQueries, messageOf, orpc } from '@erxes/core-contract/client';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ConditionsEditor, Label, Select, Spinner, ToggleGroup, useFormat } from 'erxes-ui';
import { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { tagsQuery } from '~/modules/tags/useTags';
import { useFilterFields, useViews } from '~/modules/views/useViews';

const MODES = ['everyone', 'view', 'filter'] as const;

export type AudienceMode = (typeof MODES)[number];

type Audience = Pick<Broadcast, 'viewId' | 'filter'>;

export const modeOf = (audience: Audience): AudienceMode =>
  audience.viewId ? 'view' : audience.filter ? 'filter' : 'everyone';

/** A view or a filter was asked for but none is set: sending would go to everyone. */
export const isAudienceMissing = (mode: AudienceMode, audience: Audience) =>
  (mode === 'view' && !audience.viewId) || (mode === 'filter' && !audience.filter);

/** A saved customer or lead view to send to. */
const ViewSelect = ({
  value,
  onChange,
  disabled,
}: {
  value: string | null;
  onChange: (viewId: string) => void;
  disabled?: boolean;
}) => {
  const { t } = useTranslation('broadcasts');
  const customers = useViews('customer');
  const leads = useViews('lead');
  const error = customers.error ?? leads.error;

  const groups: [string, View[]][] = [
    [t('views-customers', 'Customers'), customers.data?.data ?? []],
    [t('views-leads', 'Leads'), leads.data?.data ?? []],
  ];

  if (error) return <p className="text-sm text-destructive-text">{messageOf(error)}</p>;

  return (
    <Select
      value={value ?? ''}
      onValueChange={(next) => next && onChange(next)}
      disabled={disabled}
    >
      <Select.Trigger aria-label={t('view', 'Saved view')}>
        <Select.Value placeholder={t('view-pick', 'Pick a saved view')} />
      </Select.Trigger>
      <Select.Content>
        {groups.map(([label, views]) =>
          views.length ? (
            <Select.Group key={label}>
              <Select.Label>{label}</Select.Label>
              {views.map((view) => (
                <Select.Item key={view.id} value={view.id}>
                  {view.name}
                </Select.Item>
              ))}
            </Select.Group>
          ) : null,
        )}
      </Select.Content>
    </Select>
  );
};

/** The broadcast's own filter, on the customer list's fields. */
const AudienceFilter = ({
  value,
  onChange,
  disabled,
}: {
  value: ConditionGroup | null;
  onChange: (filter: ConditionGroup | null) => void;
  disabled?: boolean;
}) => {
  const fields = useFilterFields('customer');

  if (fields.error)
    return <p className="text-sm text-destructive-text">{messageOf(fields.error)}</p>;

  return (
    <ConditionsEditor
      value={value ?? undefined}
      onChange={(next) => onChange(next ?? null)}
      disabled={disabled}
      fields={(fields.data ?? []).map(({ options, relation, ...field }) => ({
        ...field,
        options: options?.map((option) => ({ value: option, label: option })),
        relation: relation && {
          label: relation.label,
          fields: relation.fields.map((inner) => ({
            ...inner,
            options: inner.options?.map((option) => ({ value: option, label: option })),
          })),
        },
      }))}
      members={memberQueries}
      tags={tagsQuery('customer')}
    />
  );
};

/** Who the audience reaches on the channel right now. */
const Estimate = ({ channel, audience }: { channel: Broadcast['channel']; audience: Audience }) => {
  const { t } = useTranslation('broadcasts');
  const fmt = useFormat();
  const input = useDeferredValue({ channel, ...audience });

  const estimate = useQuery(
    orpc.broadcasts.audience.queryOptions({ input, placeholderData: keepPreviousData }),
  );

  if (estimate.error)
    return <p className="text-sm text-destructive-text">{messageOf(estimate.error)}</p>;

  if (!estimate.data) return <Spinner size="sm" />;

  const { matched, reachable, noAddress, suppressed } = estimate.data;

  return (
    <div className="rounded-lg border bg-muted/40 p-3 text-sm" aria-live="polite">
      <p className="font-medium">
        {t('reaches', 'Reaches {{reachable}} of {{matched}} matching customers', {
          reachable: fmt.number(reachable),
          matched: fmt.number(matched),
        })}
      </p>
      <p className="text-xs text-muted-foreground">
        {channel === 'email'
          ? t('no-email', '{{count}} have no email', { count: noAddress })
          : t('no-phone', '{{count}} have no phone', { count: noAddress })}
        {' · '}
        {t('suppressed-count', '{{count}} suppressed', { count: suppressed })}
        {' · '}
        {t('frozen', 'The list is fixed when sending starts')}
      </p>
    </div>
  );
};

/** Who gets it: everyone, a saved view, or a filter; with a live estimate. */
export const AudienceSection = ({
  channel,
  mode,
  onModeChange,
  audience,
  onChange,
  disabled,
}: {
  channel: Broadcast['channel'];
  mode: AudienceMode;
  onModeChange: (mode: AudienceMode) => void;
  audience: Audience;
  onChange: (audience: Audience) => void;
  disabled?: boolean;
}) => {
  const { t } = useTranslation('broadcasts');

  const pick = (next: AudienceMode) => {
    onModeChange(next);

    // Another mode starts empty: a view or a filter is picked next.
    if (next !== mode) onChange({ viewId: null, filter: null });
  };

  return (
    <section className="space-y-3">
      <Label>{t('audience', 'Audience')}</Label>
      <ToggleGroup
        variant="outline"
        value={[mode]}
        disabled={disabled}
        onValueChange={([next]) => {
          const found = MODES.find((item) => item === next);

          if (found) pick(found);
        }}
        className="w-full"
      >
        <ToggleGroup.Item value="everyone" className="flex-1">
          {t('audience-everyone', 'All customers')}
        </ToggleGroup.Item>
        <ToggleGroup.Item value="view" className="flex-1">
          {t('audience-view', 'A saved view')}
        </ToggleGroup.Item>
        <ToggleGroup.Item value="filter" className="flex-1">
          {t('audience-filter', 'A filter')}
        </ToggleGroup.Item>
      </ToggleGroup>
      {mode === 'view' && (
        <ViewSelect
          value={audience.viewId}
          disabled={disabled}
          onChange={(viewId) => onChange({ viewId, filter: null })}
        />
      )}
      {mode === 'filter' && (
        <AudienceFilter
          value={audience.filter}
          disabled={disabled}
          onChange={(filter) => onChange({ viewId: null, filter })}
        />
      )}
      {isAudienceMissing(mode, audience) ? (
        <p className="text-sm text-muted-foreground">
          {mode === 'view'
            ? t('audience-pick-view', 'Pick the view to send to.')
            : t('audience-add-rule', 'Add a rule to say who gets it.')}
        </p>
      ) : (
        <Estimate channel={channel} audience={audience} />
      )}
    </section>
  );
};
