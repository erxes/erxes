import { CoreModulePanel } from '@/side-panel/components/CoreModulePanel';
import { useTranslation } from 'react-i18next';
import { IconGitBranch, IconPlus } from '@tabler/icons-react';
import {
  Button,
  Form,
  Kbd,
  Spinner,
  useScopedHotkeys,
  useToast,
} from 'erxes-ui';
import { useEffect } from 'react';
import { ApolloError } from '@apollo/client';
import { BranchHotKeyScope, TBranchForm } from '../../types/branch';
import { BranchForm } from './BranchForm';
import { useBranchForm } from '../../hooks/useBranchForm';
import { SubmitHandler } from 'react-hook-form';
import { useBranchAdd, useBranchEdit } from '../../hooks/useBranchActions';
import { useBranchCreateSheet } from '../../hooks/useStructureCreateSheet';
import { Can, usePermissionCheck } from 'ui-modules';

export const CreateBranch = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const {
    methods,
    methods: { handleSubmit },
  } = useBranchForm();
  const { target, isOpen, openSheet, closeSheet } = useBranchCreateSheet();
  const { handleAdd, loading } = useBranchAdd();
  const { handleEdit } = useBranchEdit();
  const { toast } = useToast();
  const { isLoaded, hasActionPermission } = usePermissionCheck();
  const canManageBranches = isLoaded && hasActionPermission('branchesManage');
  const presetParentId = target?.parentId;

  // A chart "+" opens the sheet with its parent already chosen
  useEffect(() => {
    methods.setValue('parentId', presetParentId ?? '');
  }, [presetParentId, methods]);

  useScopedHotkeys(
    `c`,
    () => {
      if (!canManageBranches) return;
      openSheet();
    },
    BranchHotKeyScope.BranchSettingsPage,
  );
  useScopedHotkeys(`esc`, () => closeSheet(), BranchHotKeyScope.BranchAddSheet);

  const showError = (error: ApolloError) =>
    toast({
      title: t('error'),
      description: error.message,
      variant: 'destructive',
    });

  const submitHandler: SubmitHandler<TBranchForm> = (data) => {
    const insertBefore = target?.insertBefore;

    handleAdd({
      variables: data,
      onCompleted: ({ branchesAdd }) => {
        if (insertBefore) {
          // The backend rebuilds `order` from the code, so it must be sent
          handleEdit({
            variables: {
              id: insertBefore._id,
              code: insertBefore.code,
              parentId: branchesAdd._id,
            },
            onError: showError,
          });
        }
        toast({
          title: t('success'),
          variant: 'success',
          description: t('branch-created'),
        });
        methods.reset();
        closeSheet();
      },
      onError: showError,
    });
  };
  return (
    <CoreModulePanel
      requiredPermission="branchesManage"
      name={'settings/structure/branches/CreateBranch'}
      onOpenChange={(open) => (open ? openSheet() : closeSheet())}
      open={isOpen}
    >
      <Can action="branchesManage">
        <CoreModulePanel.Trigger asChild>
          <Button>
            <IconPlus /> {t('create-branch')}
            <Kbd>C</Kbd>
          </Button>
        </CoreModulePanel.Trigger>
      </Can>
      <CoreModulePanel.View
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
            <CoreModulePanel.Header>
              <CoreModulePanel.Title className="text-lg text-foreground flex items-center gap-1">
                <IconGitBranch size={16} />
                {t('create-branch-title')}
              </CoreModulePanel.Title>
              <CoreModulePanel.Close />
            </CoreModulePanel.Header>
            <CoreModulePanel.Content className="grow size-full h-auto flex flex-col px-5 py-4">
              <BranchForm />
            </CoreModulePanel.Content>
            <CoreModulePanel.Footer>
              <Button variant={'ghost'} onClick={closeSheet}>
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Spinner /> : t('create')}
              </Button>
            </CoreModulePanel.Footer>
          </form>
        </Form>
      </CoreModulePanel.View>
    </CoreModulePanel>
  );
};
