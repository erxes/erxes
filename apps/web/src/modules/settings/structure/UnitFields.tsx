import { memberQueries } from '@erxes/core-contract/client';
import { Input, Label, LookupPicker, SelectMember, useMemberOptions } from 'erxes-ui';
import { type ReactNode, useId } from 'react';
import { useTranslation } from 'react-i18next';
import type { Draft } from './UnitSheet';

/** A group of fields under a small heading, ruled off from the one above. */
export const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="flex flex-col gap-3 border-t pt-4 first:border-t-0 first:pt-0">
    <h3 className="text-sm font-semibold">{title}</h3>
    {children}
  </section>
);

export const Field = ({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string | null;
  children: ReactNode;
}) => (
  <div className="flex min-w-0 flex-col gap-1.5">
    <Label htmlFor={id}>
      {label}
      {required && <span className="text-destructive"> *</span>}
    </Label>
    {children}
    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>
);

/** A text field that keeps `null` for empty. */
export const TextField = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel';
}) => {
  const id = useId();

  return (
    <Field id={id} label={label}>
      <Input
        id={id}
        type={type}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value || null)}
      />
    </Field>
  );
};

type FieldsProps = { draft: Draft; set: (changes: Partial<Draft>) => void };

/** Who leads the unit and who is in it. */
export const PeopleFields = ({ draft, set }: FieldsProps) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const memberOptions = useMemberOptions(memberQueries, true, draft.memberIds);
  const ids = { supervisor: useId(), members: useId() };

  return (
    <Section title={t('people', 'People')}>
      <Field id={ids.supervisor} label={t('supervisor', 'Supervisor')}>
        <SelectMember.Field
          id={ids.supervisor}
          value={draft.supervisorId}
          onValueChange={(supervisorId) => set({ supervisorId })}
          members={memberQueries}
          noneLabel={t('no-supervisor', 'No supervisor')}
          placeholder={t('no-supervisor', 'No supervisor')}
        />
      </Field>
      <Field id={ids.members} label={t('members', 'Members')}>
        <LookupPicker
          lookup={memberOptions}
          multiple
          value={draft.memberIds}
          onValueChange={(memberIds) => set({ memberIds })}
          placeholder={t('pick-members', 'Choose team members')}
        />
      </Field>
      <p className="text-xs text-muted-foreground">
        {t(
          'supervisor-hint',
          'The supervisor sees the records of this unit and the units under it.',
        )}
      </p>
    </Section>
  );
};

/** A branch's address, phone and email. */
export const ContactFields = ({ draft, set }: FieldsProps) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });

  return (
    <Section title={t('contact', 'Contact')}>
      <TextField
        label={t('address', 'Address')}
        value={draft.address}
        onChange={(address) => set({ address })}
      />
      <div className="grid grid-cols-2 gap-3">
        <TextField
          label={t('phone', 'Phone')}
          type="tel"
          value={draft.phone}
          onChange={(phone) => set({ phone })}
        />
        <TextField
          label={t('email', 'Email')}
          type="email"
          value={draft.email}
          onChange={(email) => set({ email })}
        />
      </div>
    </Section>
  );
};
