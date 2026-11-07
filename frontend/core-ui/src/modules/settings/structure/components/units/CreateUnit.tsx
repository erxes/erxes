import { StructureCreateForm } from '@/settings/structure/components/StructureCreateForm';
import { StructureCreateButton } from '@/settings/structure/components/StructureFormActions';
import { useStructureFormFeedback } from '@/settings/structure/hooks/useStructureFormFeedback';
import { TUnitForm, UnitHotKeyScope } from '../../types/unit';
import { SubmitHandler } from 'react-hook-form';
import { PagePanelStatus } from '@/side-panel/components/PagePanelStatus';
import {
  createPagePanelPortal as createPortal,
  usePagePanel,
} from '@/side-panel/hooks/usePagePanel';
import { useTranslation } from 'react-i18next';
import { IconUsersGroup } from '@tabler/icons-react';
import {
  usePreviousHotkeyScope,
  useScopedHotkeys,
  useSetHotkeyScope,
} from 'erxes-ui';
import React, { useState } from 'react';
import { useUnitForm } from '@/settings/structure/hooks/useUnitForm';
import { useUnitAdd } from '@/settings/structure/hooks/useUnitActions';
import { UnitForm } from '@/settings/structure/components/units/UnitForm';
import { usePermissionCheck, RecordSidePanel } from 'ui-modules';
export const CreateUnit = () => {
  const { t } = useTranslation('settings', {
    keyPrefix: 'structure',
  });
  const { methods } = useUnitForm();
  const [open, setOpen] = useState<boolean>(false);
  const { handleAdd, loading } = useUnitAdd();
  const setHotkeyScope = useSetHotkeyScope();
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();
  const { isLoaded, hasActionPermission } = usePermissionCheck();
  const canManageUnits = isLoaded && hasActionPermission('unitsManage');
  const onOpen = () => {
    setOpen(true);
    setHotkeyScopeAndMemorizePreviousScope(UnitHotKeyScope.UnitAddSheet);
  };
  const onClose = () => {
    setHotkeyScope(UnitHotKeyScope.UnitSettingsPage);
    setOpen(false);
  };
  useScopedHotkeys(
    `c`,
    () => {
      if (!canManageUnits) return;
      onOpen();
    },
    UnitHotKeyScope.UnitSettingsPage,
  );
  useScopedHotkeys(`esc`, () => onClose(), UnitHotKeyScope.UnitAddSheet);
  const pagePanel = usePagePanel({
    requiredPermission: 'unitsManage',
    name: 'settings/structure/units/CreateUnit',
    onOpenChange: (open) => (open ? onOpen() : onClose()),
    open: open,
  });
  const feedback = useStructureFormFeedback({
    isCurrent: pagePanel.isCurrent,
    message: t('unit-created'),
    onSuccess: () => {
      methods.reset();
      setOpen(false);
    },
  });
  const submitHandler: SubmitHandler<TUnitForm> = async (data) => {
    handleAdd({
      variables: data,
      ...feedback,
    });
  };

  return (
    <>
      <StructureCreateButton
        permission="unitsManage"
        onClick={pagePanel.onOpen}
        label={t('create-unit')}
      />
      {createPortal(
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
          {pagePanel.permissionsLoaded && pagePanel.allowed ? (
            <StructureCreateForm
              header={
                <RecordSidePanel.Header
                  avatar={<IconUsersGroup size={16} />}
                  title={t('create-unit-title')}
                  {...pagePanel.headerProps}
                />
              }
              methods={methods}
              onSubmit={submitHandler}
              onCancel={() => setOpen(false)}
              saving={loading}
              saveLabel={t('create')}
            >
              <UnitForm />
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
