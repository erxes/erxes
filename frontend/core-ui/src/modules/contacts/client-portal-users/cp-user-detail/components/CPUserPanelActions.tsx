import { useMutation } from '@apollo/client';
import { IconDotsVertical, IconKey, IconTrash } from '@tabler/icons-react';
import { Button, Command, Popover, toast, useConfirm } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Can, useSidePanel } from 'ui-modules';
import { CP_USERS_REMOVE } from '@/contacts/client-portal-users/graphql/cpUsersRemove';
import { GET_CLIENT_PORTAL_USERS } from '@/contacts/client-portal-users/graphql/getClientPortalUsers';
import type { ICPUser } from '@/contacts/client-portal-users/types/cpUser';
import { CPUserSetPasswordDialog } from './CPUserSetPasswordDialog';

export const CPUserPanelActions = ({ user }: { user: ICPUser }) => {
  const { t } = useTranslation('contact');
  const { confirm } = useConfirm();
  const { back, canGoBack, close } = useSidePanel();
  const [open, setOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [remove, { loading }] = useMutation(CP_USERS_REMOVE, {
    refetchQueries: [{ query: GET_CLIENT_PORTAL_USERS }],
    onError: (error) =>
      toast({
        title: t('error', 'Error'),
        description: error.message,
        variant: 'destructive',
      }),
    onCompleted: () => {
      if (canGoBack) back();
      else close();
      toast({
        title: t('success', 'Success'),
        description: t('clientPortalUser.delete.success', 'User deleted'),
        variant: 'success',
      });
    },
  });
  const deleteUser = async () => {
    setOpen(false);
    try {
      await confirm({
        message: t(
          'clientPortalUser.delete.confirm',
          'Are you sure you want to delete this client portal user?',
        ),
        options: {
          confirmationValue: 'delete',
          okLabel: t('delete', 'Delete'),
        },
      });
    } catch {
      return;
    }
    await remove({ variables: { ids: [user._id] } }).catch(() => undefined);
  };
  return (
    <Can action="clientPortalManage">
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label={t('actions', 'Actions')}
            title={t('actions', 'Actions')}
          >
            <IconDotsVertical className="size-4" />
          </Button>
        </Popover.Trigger>
        <Popover.Content
          align="end"
          className="min-w-[280px] p-0"
          onCloseAutoFocus={(event) => {
            if (passwordOpen) event.preventDefault();
          }}
        >
          <Command>
            <Command.List>
              <Command.Group>
                <Command.Item
                  onSelect={() => {
                    setOpen(false);
                    setPasswordOpen(true);
                  }}
                >
                  <IconKey />
                  {t('clientPortalUser.set-password', 'Set password')}
                </Command.Item>
              </Command.Group>
              <Command.Separator />
              <Command.Group>
                <Command.Item
                  className="text-destructive"
                  disabled={loading}
                  onSelect={() => {
                    void deleteUser();
                  }}
                >
                  <IconTrash />
                  {t('delete', 'Delete')}
                </Command.Item>
              </Command.Group>
            </Command.List>
          </Command>
        </Popover.Content>
      </Popover>
      <CPUserSetPasswordDialog
        open={passwordOpen}
        onOpenChange={setPasswordOpen}
        cpUserId={user._id}
      />
    </Can>
  );
};
