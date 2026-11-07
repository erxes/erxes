import { StructureCreateForm } from '@/settings/structure/components/StructureCreateForm';
import { StructureCreateButton } from '@/settings/structure/components/StructureFormActions';
import { useStructureFormFeedback } from '@/settings/structure/hooks/useStructureFormFeedback';
import { SubmitHandler } from 'react-hook-form';
import { TBranchForm, BranchHotKeyScope } from '../../types/branch';
import { PagePanelStatus } from '@/side-panel/components/PagePanelStatus';
import {
  createPagePanelPortal as createPortal,
  usePagePanel,
} from '@/side-panel/hooks/usePagePanel';
import { useTranslation } from 'react-i18next';
import { IconGitBranch } from '@tabler/icons-react';
import { useScopedHotkeys } from 'erxes-ui';
import { useEffect } from 'react';
import { BranchForm } from '@/settings/structure/components/branches/BranchForm';
import { useBranchForm } from '@/settings/structure/hooks/useBranchForm';
import {
  useBranchAdd,
  useBranchEdit,
} from '@/settings/structure/hooks/useBranchActions';
import { useBranchCreateSheet } from '@/settings/structure/hooks/useStructureCreateSheet';
import { usePermissionCheck, RecordSidePanel } from 'ui-modules';
export const CreateBranch = () => {
  const { t } = useTranslation('settings', {
    keyPrefix: 'structure',
  });
  const { methods } = useBranchForm();
  const { target, isOpen, openSheet, closeSheet } = useBranchCreateSheet();
  const { handleAdd, loading } = useBranchAdd();
  const { handleEdit } = useBranchEdit();
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
  const pagePanel = usePagePanel({
    expandable: false,
    requiredPermission: 'branchesManage',
    name: 'settings/structure/branches/CreateBranch',
    onOpenChange: (open) => (open ? openSheet() : closeSheet()),
    open: isOpen,
  });
  const feedback = useStructureFormFeedback({
    isCurrent: pagePanel.isCurrent,
    message: t('branch-created'),
    onSuccess: () => {
      methods.reset();
      closeSheet();
    },
  });
  const submitHandler: SubmitHandler<TBranchForm> = (data) => {
    const insertBefore = target?.insertBefore;
    handleAdd({
      variables: data,
      onCompleted: ({ branchesAdd }) => {
        if (!pagePanel.isCurrent()) return;
        if (insertBefore) {
          // The backend rebuilds `order` from the code, so it must be sent
          handleEdit({
            variables: {
              id: insertBefore._id,
              code: insertBefore.code,
              parentId: branchesAdd._id,
            },
            onError: feedback.onError,
          });
        }
        feedback.onCompleted();
      },
      onError: feedback.onError,
    });
  };

  return (
    <>
      <StructureCreateButton
        permission="branchesManage"
        onClick={pagePanel.onOpen}
        label={t('create-branch')}
      />
      {createPortal(
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
          {pagePanel.permissionsLoaded && pagePanel.allowed ? (
            <StructureCreateForm
              header={
                <RecordSidePanel.Header
                  avatar={<IconGitBranch size={16} />}
                  title={t('create-branch-title')}
                  {...pagePanel.headerProps}
                />
              }
              methods={methods}
              onSubmit={submitHandler}
              onCancel={closeSheet}
              saving={loading}
              saveLabel={t('create')}
            >
              <BranchForm />
            </StructureCreateForm>
          ) : (
            <PagePanelStatus entry={pagePanel} />
          )}
        </div>,
        pagePanel,
      )}
    </>
  );
};
