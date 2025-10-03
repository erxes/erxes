import { FormProvider, SubmitHandler, useFieldArray } from 'react-hook-form';
import { Button, ScrollArea, Spinner, Table, useToast } from 'erxes-ui';
import { TUserForm } from '@/settings/team-member/types';
import { useCallback, useState } from 'react';
import { IconSend } from '@tabler/icons-react';
import { useUsersInvite } from '@/settings/team-member/hooks/useUsersInvite';
import { useUsersSubmitForm } from '@/settings/team-member/hooks/useUserForm';
import { InviteRow } from './InviteRow';
import { InviteHeaderCheckbox } from './InviteRowCheckbox';
import { InviteMemberContext } from '../../context/InviteMemberContext';
import { AddInviteRowButton } from './AddInviteRow';
import { InviteRowRemoveButton } from './RemoveButton';

export function InviteForm({
  setIsOpen,
}: {
  setIsOpen: (open: boolean) => void;
}) {
  const {
    methods,
    methods: { control, handleSubmit },
  } = useUsersSubmitForm();
  const { toast } = useToast();
  const { handleInvitations, loading } = useUsersInvite();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'entries',
  });

  const submitHandler: SubmitHandler<TUserForm> = useCallback(
    async (data) => {
      try {
        handleInvitations({
          variables: {
            entries: data?.entries,
          },
          onCompleted() {
            toast({ title: 'Invitation has been sent' });
            setIsOpen(false);
          },
        });
      } catch (error) {
        console.error('Error submitting form:', error);
        toast({ title: error.message, variant: 'destructive' });
      }
    },
    [handleInvitations, setIsOpen, toast],
  );

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(submitHandler)} className="h-full">
        <ScrollArea className="max-h-[400px] flex flex-col">
          <Table className="p-1 overflow-hidden rounded-lg bg-sidebar border-sidebar">
            <InviteMemberContext.Provider
              value={{
                selectedUsers,
                setSelectedUsers,
                fields: fields as any,
              }}
            >
              <InviteTableHeader />
              <Table.Body className="overflow-hidden">
                {fields.map((field, index) => (
                  <InviteRow userIndex={index} user={field} key={field.id} />
                ))}
              </Table.Body>
              <Table.Footer>
                <tr>
                  <td colSpan={3} className="p-4">
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
          <Button type="submit" disabled={loading} className="text-sm">
            {(loading && (
              <Spinner size={'sm'} className="stroke-white" />
            )) || <IconSend size={16} />}
            Send invites
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

const InviteTableHeader = () => {
  return (
    <Table.Header>
      <Table.Row>
        <InviteHeaderCheckbox />
        <Table.Head>Email</Table.Head>
        <Table.Head>Password</Table.Head>
        {/* <Table.Head>Permission</Table.Head>
        <Table.Head>Unit</Table.Head>
        <Table.Head>Department</Table.Head>
        <Table.Head>Branch</Table.Head> */}
      </Table.Row>
    </Table.Header>
  );
};
