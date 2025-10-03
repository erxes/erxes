import { IconPlus, IconX } from '@tabler/icons-react';
import {
  Button,
  Dialog,
  Form,
  Kbd,
  usePreviousHotkeyScope,
  useScopedHotkeys,
  useSetHotkeyScope,
} from 'erxes-ui';

import React, { useState } from 'react';
// import { SubmitHandler } from 'react-hook-form';
import { useAddMemberForm } from '@/team/hooks/useAddMemberForm';
// import { useMemberCreate } from '@/team/hooks/useMemberCreate';
import { TeamHotKeyScope, TTeamMemberForm } from '@/team/types';
import { MemberForm } from '@/team/components/members/MemberForm';
import { useAddTeamMember } from '@/team/hooks/useAddTeamMember';
import { SubmitHandler } from 'react-hook-form';
import { useToast } from 'erxes-ui';
import { useParams } from 'react-router';

export const AddMembers = () => {
  const form = useAddMemberForm({});
  const { id: teamId } = useParams();

  const { toast } = useToast();

  const { addTeamMember, loading } = useAddTeamMember();

  const [_open, _setOpen] = useState<boolean>(false);
  const setHotkeyScope = useSetHotkeyScope();
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();

  const onOpen = (open: boolean) => {
    _setOpen(open);
    setHotkeyScopeAndMemorizePreviousScope(TeamHotKeyScope.TeamCreateSheet);
  };

  const onClose = () => {
    setHotkeyScope(TeamHotKeyScope.TeamSettingsPage);
    _setOpen(false);
  };

  useScopedHotkeys(`c`, () => onOpen(true), TeamHotKeyScope.TeamSettingsPage);
  useScopedHotkeys(`esc`, () => onClose(), TeamHotKeyScope.TeamCreateSheet);

  const submitHandler: SubmitHandler<TTeamMemberForm> = React.useCallback(
    async (data) => {
      addTeamMember({
        variables: { ...data, teamId },
        onCompleted: () => {
          toast({ title: 'Success!' });
          form.reset();
          _setOpen(false);
        },
        onError: (error) =>
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          }),
      });
    },
    [addTeamMember, toast, _setOpen, form, teamId],
  );

  return (
    <Dialog open={_open} onOpenChange={onOpen}>
      <Dialog.Trigger asChild>
        <Button>
          <IconPlus />
          Add members
          <Kbd>C</Kbd>
        </Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header className="flex-row">
          <Dialog.Title className="flex items-center gap-2">
            {/* <IconTagPlus size={16} /> */}
            Add members
          </Dialog.Title>
          <Dialog.Description className="sr-only">
            Add a new members to the team.
          </Dialog.Description>
          <Dialog.Close asChild>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-4 top-3"
            >
              <IconX />
            </Button>
          </Dialog.Close>
        </Dialog.Header>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(submitHandler)}
            className="flex flex-col size-full gap-5"
          >
            <MemberForm form={form} />
            <Button className="w-full" type="submit" disabled={loading}>
              Add
            </Button>
          </form>
        </Form>
      </Dialog.Content>
    </Dialog>
  );
};
