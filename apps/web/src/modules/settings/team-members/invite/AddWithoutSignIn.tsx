import { messageOf } from '@erxes/core-contract/client';
import { IconUserPlus } from '@tabler/icons-react';
import { Button, Dialog, Input, Label, useToast } from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTeamMemberAdd } from '../useTeamMembers';

interface Draft {
  fullName: string;
  email: string;
  employeeId: string;
  phone: string;
}

const EMPTY: Draft = { fullName: '', email: '', employeeId: '', phone: '' };

const TextField = ({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'tel';
}) => {
  const id = useId();

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
};

/** Mounted while the dialog is open, so closing it drops what was typed. */
const AddForm = ({ onDone }: { onDone: () => void }) => {
  const { t } = useTranslation('workspace', { keyPrefix: 'team-member' });
  const { toast } = useToast();
  const add = useTeamMemberAdd();
  const [draft, setDraft] = useState(EMPTY);
  const set = (changes: Partial<Draft>) => setDraft((current) => ({ ...current, ...changes }));

  const save = () =>
    add.mutate(
      {
        fullName: draft.fullName.trim(),
        email: draft.email.trim() || undefined,
        employeeId: draft.employeeId.trim() || undefined,
        phone: draft.phone.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast({ variant: 'success', title: t('member-added', 'Added to the team') });
          onDone();
        },
        onError: (error) =>
          toast({
            variant: 'destructive',
            title: t('member-add-failed', 'Could not add them'),
            description: messageOf(error),
          }),
      },
    );

  return (
    <div className="flex flex-col gap-4">
      <TextField
        label={t('full-name', 'Full name')}
        value={draft.fullName}
        onChange={(fullName) => set({ fullName })}
      />
      <TextField
        label={t('email-optional', 'Email (optional)')}
        type="email"
        value={draft.email}
        onChange={(email) => set({ email })}
      />
      <TextField
        label={t('employee-id', 'Employee ID')}
        value={draft.employeeId}
        onChange={(employeeId) => set({ employeeId })}
      />
      <TextField
        label={t('phone', 'Phone')}
        type="tel"
        value={draft.phone}
        onChange={(phone) => set({ phone })}
      />
      <Button disabled={!draft.fullName.trim() || add.isPending} onClick={save}>
        {t('add', 'Add')}
      </Button>
    </div>
  );
};

/**
 * Adds someone to the team who doesn't sign in: a worker who uses a plugin's own app (HR's) or
 * none. They join branches and departments and take no seat.
 */
export function AddWithoutSignIn() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation('workspace', { keyPrefix: 'team-member' });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger render={<Button variant="secondary" />}>
        <IconUserPlus />
        {t('add-without-sign-in', 'Add without sign-in')}
      </Dialog.Trigger>
      <Dialog.Content className="max-w-md">
        <Dialog.HeaderCombined
          title={t('add-without-sign-in', 'Add without sign-in')}
          description={t(
            'add-without-sign-in-hint',
            "For people who don't use erxes on the web, such as workers on HR's app. They count in branches and departments, take no seat, and can be invited to sign in later.",
          )}
        />
        {isOpen && <AddForm onDone={() => setIsOpen(false)} />}
      </Dialog.Content>
    </Dialog>
  );
}
