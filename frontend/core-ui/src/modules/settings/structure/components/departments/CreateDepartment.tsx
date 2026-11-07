import { StructureCreateForm } from '@/settings/structure/components/StructureCreateForm';
import { StructureCreateButton } from '@/settings/structure/components/StructureFormActions';
import { useStructureFormFeedback } from '@/settings/structure/hooks/useStructureFormFeedback';
import { TDepartmentForm, DepartmentHotKeyScope } from '../../types/department';
import { SubmitHandler } from 'react-hook-form';
import { PagePanelStatus } from '@/side-panel/components/PagePanelStatus';
import {
  createPagePanelPortal as createPortal,
  usePagePanel,
} from '@/side-panel/hooks/usePagePanel';
import { useTranslation } from 'react-i18next';
import { IconFolder } from '@tabler/icons-react';
import { useScopedHotkeys } from 'erxes-ui';
import { useEffect } from 'react';
import { useDepartmentForm } from '@/settings/structure/hooks/useDepartmentForm';
import {
  useDepartmentAdd,
  useDepartmentEdit,
} from '@/settings/structure/hooks/useDepartmentActions';
import { useDepartmentCreateSheet } from '@/settings/structure/hooks/useStructureCreateSheet';
import { DepartmentForm } from '@/settings/structure/components/departments/DepartmentForm';
import { usePermissionCheck, RecordSidePanel } from 'ui-modules';
export const CreateDepartment = () => {
  const { t } = useTranslation('settings', {
    keyPrefix: 'structure',
  });
  const { methods } = useDepartmentForm();
  const { target, isOpen, openSheet, closeSheet } = useDepartmentCreateSheet();
  const { handleAdd, loading } = useDepartmentAdd();
  const { handleEdit } = useDepartmentEdit();
  const { isLoaded, hasActionPermission } = usePermissionCheck();
  const canManageDepartments =
    isLoaded && hasActionPermission('departmentsManage');
  const presetParentId = target?.parentId;

  // A chart "+" opens the sheet with its parent already chosen
  useEffect(() => {
    methods.setValue('parentId', presetParentId ?? '');
  }, [presetParentId, methods]);
  useScopedHotkeys(
    `c`,
    () => {
      if (!canManageDepartments) return;
      openSheet();
    },
    DepartmentHotKeyScope.DepartmentSettingsPage,
  );
  useScopedHotkeys(
    `esc`,
    () => closeSheet(),
    DepartmentHotKeyScope.DepartmentAddSheet,
  );
  const pagePanel = usePagePanel({
    expandable: false,
    requiredPermission: 'departmentsManage',
    name: 'settings/structure/departments/CreateDepartment',
    onOpenChange: (open) => (open ? openSheet() : closeSheet()),
    open: isOpen,
  });
  const feedback = useStructureFormFeedback({
    isCurrent: pagePanel.isCurrent,
    message: t('department-created'),
    onSuccess: () => {
      methods.reset();
      closeSheet();
    },
  });
  const submitHandler: SubmitHandler<TDepartmentForm> = (data) => {
    const insertBefore = target?.insertBefore;
    handleAdd({
      variables: data,
      onCompleted: ({ departmentsAdd }) => {
        if (!pagePanel.isCurrent()) return;
        if (insertBefore) {
          // The backend rebuilds `order` from the code, so it must be sent
          handleEdit({
            variables: {
              id: insertBefore._id,
              code: insertBefore.code,
              parentId: departmentsAdd._id,
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
        permission="departmentsManage"
        onClick={pagePanel.onOpen}
        label={t('create-department')}
      />
      {createPortal(
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
          {pagePanel.permissionsLoaded && pagePanel.allowed ? (
            <StructureCreateForm
              header={
                <RecordSidePanel.Header
                  avatar={<IconFolder size={16} />}
                  title={t('create-department-title')}
                  {...pagePanel.headerProps}
                />
              }
              methods={methods}
              onSubmit={submitHandler}
              onCancel={closeSheet}
              saving={loading}
              saveLabel={t('create')}
            >
              <DepartmentForm />
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
