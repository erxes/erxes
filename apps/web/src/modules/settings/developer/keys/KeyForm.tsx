import { Input } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { AccessSection, KindSection } from './KeyAccess';
import { LimitsSection, type SavedExpiry } from './KeyLimits';
import { fitLimits, type KeyDraft } from './keyDraft';
import { type DraftProps, Section } from './keyParts';

/** The whole key form: name, kind, access, limits. The page around it saves. */
export const KeyForm = ({ draft, onChange, saved }: DraftProps & { saved?: SavedExpiry }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-keys.form' });
  const change = (next: KeyDraft) => onChange(fitLimits(next));

  return (
    <div className="space-y-4">
      <Section title={t('name-title', 'Name')}>
        <Input
          aria-label={t('name-title', 'Name')}
          value={draft.name}
          onChange={(event) => onChange({ ...draft, name: event.target.value })}
          placeholder={t('name-placeholder', 'What uses it, like "Website sync"')}
          maxLength={100}
        />
      </Section>
      <KindSection draft={draft} onChange={change} />
      <AccessSection draft={draft} onChange={change} />
      <LimitsSection draft={draft} onChange={change} saved={saved} />
    </div>
  );
};
