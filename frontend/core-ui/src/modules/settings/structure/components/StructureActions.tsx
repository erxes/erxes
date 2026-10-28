import { IconBriefcase, IconCategory, IconPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Can } from 'ui-modules';
import { STRUCTURE_POSITIONS_MANAGE_ACTION } from '../constants/structureCapabilities';
import { useStructureWorkspace } from '../contexts/StructureWorkspaceContext';
import { useStructureTypeDialogs } from '../hooks/useStructureTypeDialogs';
import { StructurePositionsDialog } from './positions/StructurePositionsDialog';

export const StructureActions = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { entities, selectedId, startDraft, canManage } =
    useStructureWorkspace();
  const { openNodeTypes } = useStructureTypeDialogs();
  const [positionsOpen, setPositionsOpen] = useState(false);
  const parentId =
    selectedId || entities.find((entity) => !entity.parentId)?._id;

  return (
    <div className="flex items-center gap-2">
      {canManage && parentId && (
        <Button size="sm" onClick={() => startDraft(parentId)}>
          <IconPlus />
          {selectedId ? t('add-child') : t('add-place')}
        </Button>
      )}
      <Button size="sm" variant="secondary" onClick={openNodeTypes}>
        <IconCategory />
        {t('node-types')}
      </Button>
      <Can action={STRUCTURE_POSITIONS_MANAGE_ACTION}>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setPositionsOpen(true)}
        >
          <IconBriefcase />
          {t('positions')}
        </Button>
        {positionsOpen && (
          <StructurePositionsDialog onClose={() => setPositionsOpen(false)} />
        )}
      </Can>
    </div>
  );
};
