import { StructureCreateForm } from '@/settings/structure/components/StructureCreateForm';
import { StructureCreateButton } from '@/settings/structure/components/StructureFormActions';
import { useStructureFormFeedback } from '@/settings/structure/hooks/useStructureFormFeedback';
import { TPositionForm, PositionHotKeyScope } from '../../types/position';
import { SubmitHandler } from 'react-hook-form';
import { PagePanelStatus } from '@/side-panel/components/PagePanelStatus';
import {
  createPagePanelPortal as createPortal,
  usePagePanel,
} from '@/side-panel/hooks/usePagePanel';
import { useTranslation } from 'react-i18next';
import { IconBriefcase } from '@tabler/icons-react';
import {
  usePreviousHotkeyScope,
  useScopedHotkeys,
  useSetHotkeyScope,
} from 'erxes-ui';
import React, { useState } from 'react';
import { usePositionForm } from '@/settings/structure/hooks/usePositionForm';
import { usePositionAdd } from '@/settings/structure/hooks/usePositionActions';
import { PositionForm } from '@/settings/structure/components/positions/PositionForm';
import { usePermissionCheck, RecordSidePanel } from 'ui-modules';
export const CreatePosition = () => {
  const { t } = useTranslation('settings', {
    keyPrefix: 'structure',
  });
  const { methods } = usePositionForm();
  const [open, setOpen] = useState<boolean>(false);
  const { handleAdd, loading } = usePositionAdd();
  const setHotkeyScope = useSetHotkeyScope();
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();
  const { isLoaded, hasActionPermission } = usePermissionCheck();
  const canManagePositions = isLoaded && hasActionPermission('positionsManage');
  const onOpen = () => {
    setOpen(true);
    setHotkeyScopeAndMemorizePreviousScope(
      PositionHotKeyScope.PositionAddSheet,
    );
  };
  const onClose = () => {
    setHotkeyScope(PositionHotKeyScope.PositionSettingsPage);
    setOpen(false);
  };
  useScopedHotkeys(
    `c`,
    () => {
      if (!canManagePositions) return;
      onOpen();
    },
    PositionHotKeyScope.PositionSettingsPage,
  );
  useScopedHotkeys(
    `esc`,
    () => onClose(),
    PositionHotKeyScope.PositionAddSheet,
  );
  const pagePanel = usePagePanel({
    requiredPermission: 'positionsManage',
    name: 'settings/structure/positions/CreatePosition',
    onOpenChange: (open) => (open ? onOpen() : onClose()),
    open: open,
  });
  const feedback = useStructureFormFeedback({
    isCurrent: pagePanel.isCurrent,
    message: t('position-created'),
    onSuccess: () => {
      methods.reset();
      setOpen(false);
    },
  });
  const submitHandler: SubmitHandler<TPositionForm> = (data) => {
    handleAdd({
      variables: data,
      ...feedback,
    });
  };

  return (
    <>
      <StructureCreateButton
        permission="positionsManage"
        onClick={pagePanel.onOpen}
        label={t('create-position')}
      />
      {createPortal(
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
          {pagePanel.permissionsLoaded && pagePanel.allowed ? (
            <StructureCreateForm
              header={
                <RecordSidePanel.Header
                  avatar={<IconBriefcase size={16} />}
                  title={t('create-position-title')}
                  {...pagePanel.headerProps}
                />
              }
              methods={methods}
              onSubmit={submitHandler}
              onCancel={() => setOpen(false)}
              saving={loading}
              saveLabel={t('create')}
            >
              <PositionForm />
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
