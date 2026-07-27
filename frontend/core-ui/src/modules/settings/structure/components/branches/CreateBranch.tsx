import { IconGitBranch, IconPlus } from '@tabler/icons-react';
import {
  Button,
  Form,
  Kbd,
  Sheet,
  Spinner,
  usePreviousHotkeyScope,
  useScopedHotkeys,
  useSetHotkeyScope,
  useToast,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import { BranchHotKeyScope, TBranchForm } from '../../types/branch';
import { BranchForm } from './BranchForm';
import { useBranchForm } from '../../hooks/useBranchForm';
import { SubmitHandler } from 'react-hook-form';
import { useBranchAdd } from '../../hooks/useBranchActions';
import { Can, usePermissionCheck } from 'ui-modules';

export const CreateBranch = () => {
  const { t } = useTranslation('settings');
  const {
    methods,
    methods: { handleSubmit },
  } = useBranchForm();
  const [open, setOpen] = useState<boolean>(false);
  const { handleAdd, loading } = useBranchAdd();
  const { toast } = useToast();
  const setHotkeyScope = useSetHotkeyScope();
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();
  const { isLoaded, hasActionPermission } = usePermissionCheck();
  const canManageBranches = isLoaded && hasActionPermission('branchesManage');

  const onOpen = () => {
    setOpen(true);
    setHotkeyScopeAndMemorizePreviousScope(BranchHotKeyScope.BranchAddSheet);
  };

  const onClose = () => {
    setHotkeyScope(BranchHotKeyScope.BranchSettingsPage);
    setOpen(false);
  };

  useScopedHotkeys(
    `c`,
    () => {
      if (!canManageBranches) return;
      onOpen();
    },
    BranchHotKeyScope.BranchSettingsPage,
  );
  useScopedHotkeys(`esc`, () => onClose(), BranchHotKeyScope.BranchAddSheet);

  const submitHandler: SubmitHandler<TBranchForm> = React.useCallback(
    async (data) => {
      handleAdd({
        variables: data,
        onCompleted: () => {
          toast({
            title: t('success', 'Success!'),
            variant: 'success',
            description: t('branch.created-successfully', 'Branch created successfully'),
          });
          methods.reset();
          setOpen(false);
        },
        onError: (error) =>
          toast({
            title: t('error', 'Error'),
            description: error.message,
            variant: 'destructive',
          }),
      });
    },
    [handleAdd],
  );
  return (
    <Sheet onOpenChange={(open) => (open ? onOpen() : onClose())} open={open}>
      <Can action="branchesManage">
        <Sheet.Trigger asChild>
          <Button>
            <IconPlus /> {t('branch.create', 'Create Branch')}
            <Kbd>C</Kbd>
          </Button>
        </Sheet.Trigger>
      </Can>
      <Sheet.View
        className="p-0"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <Form {...methods}>
          <form
            onSubmit={handleSubmit(submitHandler)}
            className=" flex flex-col gap-0 w-full h-full"
          >
            <Sheet.Header>
              <Sheet.Title className="text-lg text-foreground flex items-center gap-1">
                <IconGitBranch size={16} />
                {t('branch.create-title', 'Create branch')}
              </Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="grow size-full h-auto flex flex-col px-5 py-4">
              <BranchForm />
            </Sheet.Content>
            <Sheet.Footer>
              <Button variant={'ghost'} onClick={() => setOpen(false)}>
                {t('cancel', 'Cancel')}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Spinner /> : t('create', 'Create')}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
