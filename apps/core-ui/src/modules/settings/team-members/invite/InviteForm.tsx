import { zodResolver } from '@hookform/resolvers/zod';
import { IconSend } from '@tabler/icons-react';
import { Button, ScrollArea, Spinner, Table, useToast } from 'erxes-ui';
import { useState } from 'react';
import {
  FormProvider,
  type SubmitHandler,
  useFieldArray,
  useForm,
  type UseFormReturn,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { errorData, isApiError, messageOf } from '~/lib/api';
import { useTeamMembersInvite } from '../useTeamMembers';
import { AddInviteRowButton } from './AddInviteRow';
import { InviteMemberContext } from './InviteMemberContext';
import { InviteRow } from './InviteRow';
import { InviteHeaderCheckbox } from './InviteRowCheckbox';
import { INVITE_ROW_DEFAULTS, type TUserForm, USER_SUBMIT_SCHEMA } from './inviteSchema';
import { InviteRowRemoveButton } from './RemoveButton';

/** `EMAIL_TAKEN` names the emails another member has. */
const TakenEmails = z.object({ emails: z.array(z.string()) });

/** Sends every row's invitation; a taken email marks its row. */
const useInviteSubmit = (form: UseFormReturn<TUserForm>, onSent: () => void) => {
  const { toast } = useToast();
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const invite = useTeamMembersInvite();

  const submit: SubmitHandler<TUserForm> = (data) => {
    if (data.entries.length === 0) {
      toast({ title: t('add-at-least-one-email'), variant: 'destructive' });

      return;
    }

    invite.mutate(
      {
        entries: data.entries.map(({ email, password, role }) => ({
          email,
          role,
          password: password || undefined,
        })),
      },
      {
        onSuccess: () => {
          toast({ title: t('invitation-sent'), variant: 'success' });
          onSent();
        },
        onError: (error) => {
          const taken = isApiError(error, 'EMAIL_TAKEN')
            ? (errorData(error, TakenEmails)?.emails ?? [])
            : [];

          // Point at the rows whose email is taken or repeated.
          data.entries.forEach((entry, index) => {
            if (taken.includes(entry.email.trim().toLowerCase())) {
              form.setError(`entries.${index}.email`, { message: messageOf(error) });
            }
          });
          toast({
            title: t('failed-to-send-invitation'),
            description: messageOf(error),
            variant: 'destructive',
          });
        },
      },
    );
  };

  return { submit, sending: invite.isPending };
};

/** A row per member, selectable, with buttons to add and remove rows. */
const InviteTable = ({ form }: { form: UseFormReturn<TUserForm> }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'entries' });

  return (
    <Table className="p-1 overflow-hidden rounded-lg bg-sidebar border-sidebar">
      <InviteMemberContext.Provider value={{ selectedUsers, setSelectedUsers, fields }}>
        <Table.Header>
          <Table.Row>
            <InviteHeaderCheckbox />
            <Table.Head>{t('email')}</Table.Head>
            <Table.Head>{t('password')}</Table.Head>
            <Table.Head>{t('role')}</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body className="overflow-hidden">
          {fields.map((field, index) => (
            <InviteRow userIndex={index} userId={field.id} key={field.id} />
          ))}
        </Table.Body>
        <Table.Footer>
          <tr>
            <td colSpan={4} className="p-4">
              <div className="flex w-full justify-center gap-4">
                <AddInviteRowButton append={append} />
                <InviteRowRemoveButton remove={remove} />
              </div>
            </td>
          </tr>
        </Table.Footer>
      </InviteMemberContext.Provider>
    </Table>
  );
};

/** A row per member, sent together. */
export function InviteForm({ setIsOpen }: { setIsOpen: (open: boolean) => void }) {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });

  const form = useForm<TUserForm>({
    mode: 'onBlur',
    resolver: zodResolver(USER_SUBMIT_SCHEMA),
    defaultValues: { entries: [{ ...INVITE_ROW_DEFAULTS }] },
  });

  const { submit, sending } = useInviteSubmit(form, () => setIsOpen(false));

  return (
    <FormProvider {...form}>
      <form onSubmit={(event) => void form.handleSubmit(submit)(event)} className="h-full">
        <ScrollArea className="max-h-[400px] flex flex-col">
          <InviteTable form={form} />
          <ScrollArea.Bar />
        </ScrollArea>
        <div className="mt-3 w-full flex gap-3 justify-end">
          <Button type="submit" disabled={sending}>
            {sending ? <Spinner size="sm" /> : <IconSend size={16} />}
            {t('send-invites')}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
