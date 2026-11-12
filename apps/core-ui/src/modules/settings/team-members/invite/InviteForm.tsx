import { zodResolver } from '@hookform/resolvers/zod';
import { IconSend } from '@tabler/icons-react';
import { Button, ScrollArea, Spinner, Table, useToast } from 'erxes-ui';
import { useState } from 'react';
import { FormProvider, type SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { isApiError, messageOf } from '~/lib/api';
import { useTeamMembersInvite } from '../useTeamMembers';
import { AddInviteRowButton } from './AddInviteRow';
import { InviteMemberContext } from './InviteMemberContext';
import { InviteRow } from './InviteRow';
import { InviteHeaderCheckbox } from './InviteRowCheckbox';
import { INVITE_ROW_DEFAULTS, type TUserForm, USER_SUBMIT_SCHEMA } from './inviteSchema';
import { InviteRowRemoveButton } from './RemoveButton';

/** Emails the API names as already taken (`EMAIL_TAKEN` data). */
const takenEmails = (error: unknown): string[] => {
  if (!isApiError(error, 'EMAIL_TAKEN')) return [];

  const data: unknown = error.data;
  const emails = data && typeof data === 'object' && 'emails' in data ? data.emails : undefined;

  return Array.isArray(emails)
    ? emails.filter((email): email is string => typeof email === 'string')
    : [];
};

/** Old core-ui multi-row invite form: a row per member, sent together. */
export function InviteForm({ setIsOpen }: { setIsOpen: (open: boolean) => void }) {
  const methods = useForm<TUserForm>({
    mode: 'onBlur',
    resolver: zodResolver(USER_SUBMIT_SCHEMA),
    defaultValues: { entries: [{ ...INVITE_ROW_DEFAULTS }] },
  });

  const { control, handleSubmit, setError } = methods;
  const { toast } = useToast();
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const invite = useTeamMembersInvite();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const { fields, append, remove } = useFieldArray({ control, name: 'entries' });

  const submitHandler: SubmitHandler<TUserForm> = (data) => {
    if (data.entries.length === 0) {
      toast({ title: t('add-at-least-one-email'), variant: 'destructive' });

      return;
    }

    invite.mutate(
      data.entries.map(({ email, password, role }) => ({
        email,
        role,
        password: password || undefined,
      })),
      {
        onSuccess: () => {
          toast({ title: t('invitation-sent'), variant: 'success' });
          setIsOpen(false);
        },
        onError: (error) => {
          const taken = takenEmails(error);

          // Point at the rows whose email is taken or repeated.
          data.entries.forEach((entry, index) => {
            if (taken.includes(entry.email.trim().toLowerCase())) {
              setError(`entries.${index}.email`, { message: messageOf(error) });
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

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(submitHandler)} className="h-full">
        <ScrollArea className="max-h-[400px] flex flex-col">
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
          <ScrollArea.Bar />
        </ScrollArea>
        <div className="mt-3 w-full flex gap-3 justify-end">
          <Button type="submit" disabled={invite.isPending} className="text-sm">
            {invite.isPending ? (
              <Spinner size="sm" className="stroke-white" />
            ) : (
              <IconSend size={16} />
            )}
            {t('send-invites')}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
