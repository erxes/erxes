import { API_KEY_LIFETIMES } from '@erxes/core-contract';
import { ChoiceboxGroup, Label, MultipleSelector, Select, Textarea, useFormat } from 'erxes-ui';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { type ContactScope, isLimited, type Lifetime } from './keyDraft';
import { type DraftProps, Section } from './keyParts';
import { useKeyLookups } from './useKeyLookups';

const NEVER = 'never';
const KEEP = 'keep';
const SCOPES = ['all', 'own', 'units'] as const satisfies readonly ContactScope[];

const picked = (ids: string[], options: { value: string; label: string }[]) =>
  options.filter((option) => ids.includes(option.value));

const lifetimeOf = (value: string): Lifetime =>
  API_KEY_LIFETIMES.find((days) => String(days) === value) ?? null;

/** Which contacts a regular key sees: all, the maker's, a branch's or department's; with tags. */
const ContactLimits = ({ draft, onChange }: DraftProps) => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-keys.form' });
  const unitsId = useId();
  const tagsId = useId();
  const { units, tags } = useKeyLookups();

  const labels: Record<ContactScope, string> = {
    all: t('scope-all', 'All'),
    own: t('scope-own', 'Only mine'),
    units: t('scope-units', 'In branches or departments'),
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{t('contacts', 'Which contacts')}</Label>
        <ChoiceboxGroup
          direction="row"
          spacing="tight"
          value={draft.scope}
          onValueChange={(value) =>
            onChange({ ...draft, scope: value === 'own' || value === 'units' ? value : 'all' })
          }
          className="flex-col sm:flex-row"
        >
          {SCOPES.map((scope) => (
            <ChoiceboxGroup.Item key={scope} value={scope}>
              <span className="text-sm font-medium">{labels[scope]}</span>
            </ChoiceboxGroup.Item>
          ))}
        </ChoiceboxGroup>
        {draft.scope === 'units' && (
          <MultipleSelector
            id={unitsId}
            value={picked(draft.unitIds, units)}
            onChange={(chosen) => onChange({ ...draft, unitIds: chosen.map((unit) => unit.value) })}
            options={units}
            placeholder={t('units-placeholder', 'Choose branches or departments')}
            hidePlaceholderWhenSelected
          />
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={tagsId}>{t('tags', 'Only with these tags')}</Label>
        <MultipleSelector
          id={tagsId}
          value={picked(draft.tagIds, tags)}
          onChange={(chosen) => onChange({ ...draft, tagIds: chosen.map((tag) => tag.value) })}
          options={tags}
          placeholder={t('tags-placeholder', 'Any tag')}
          hidePlaceholderWhenSelected
        />
      </div>
      {isLimited(draft) && (
        <p className="text-xs text-muted-foreground">
          {t(
            'limited-areas',
            "With contact limits the key opens contacts and products only: payments, files and automations don't follow them.",
          )}
        </p>
      )}
    </div>
  );
};

/** A saved key's expiry: undefined for a new key, null for one that never stops. */
export type SavedExpiry = Date | string | null | undefined;

const Expiry = ({ draft, onChange, saved }: DraftProps & { saved: SavedExpiry }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-keys.form' });
  const fmt = useFormat();
  const lifetimeId = useId();

  return (
    <div className="space-y-1.5">
      <Label htmlFor={lifetimeId}>{t('expires', 'Stops working')}</Label>
      <Select
        value={draft.lifetime === null ? NEVER : String(draft.lifetime)}
        onValueChange={(next) =>
          next && onChange({ ...draft, lifetime: next === KEEP ? KEEP : lifetimeOf(next) })
        }
      >
        <Select.Trigger id={lifetimeId} className="w-full sm:w-60">
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          {saved !== undefined && (
            <Select.Item value={KEEP}>
              {saved
                ? t('keep-date', '{{date}} (no change)', { date: fmt.date(saved) })
                : t('keep-never', 'Only when revoked (no change)')}
            </Select.Item>
          )}
          {API_KEY_LIFETIMES.map((days) => (
            <Select.Item key={days} value={String(days)}>
              {t('in-days', { count: days, defaultValue: `In ${days} days` })}
            </Select.Item>
          ))}
          {draft.kind === 'regular' && (
            <Select.Item value={NEVER}>{t('never', 'Only when revoked')}</Select.Item>
          )}
        </Select.Content>
      </Select>
      {draft.kind === 'management' && (
        <p className="text-xs text-muted-foreground">
          {t('must-expire', 'Management keys always stop working on a date.')}
        </p>
      )}
    </div>
  );
};

/** Optional limits: contacts, addresses, expiry. */
export const LimitsSection = ({ draft, onChange, saved }: DraftProps & { saved: SavedExpiry }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-keys.form' });
  const ipsId = useId();

  return (
    <Section
      title={t('limits-title', 'Limits')}
      hint={t('limits-hint', 'Optional. Leave them as they are for no extra limits.')}
    >
      {draft.kind === 'regular' && draft.areas.contacts && (
        <ContactLimits draft={draft} onChange={onChange} />
      )}
      <div className="space-y-1.5">
        <Label htmlFor={ipsId}>{t('ips', 'Only from these addresses')}</Label>
        <Textarea
          id={ipsId}
          rows={2}
          value={draft.ips}
          onChange={(event) => onChange({ ...draft, ips: event.target.value })}
          placeholder={t(
            'ips-placeholder',
            'Any address. Or one per line: 203.0.113.7 or 10.0.0.0/8',
          )}
        />
      </div>
      <Expiry draft={draft} onChange={onChange} saved={saved} />
    </Section>
  );
};
