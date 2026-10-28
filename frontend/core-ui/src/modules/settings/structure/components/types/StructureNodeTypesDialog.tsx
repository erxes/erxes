import { IconPlus, IconSettings, IconTrash } from '@tabler/icons-react';
import {
  Badge,
  Button,
  Dialog,
  Skeleton,
  TextField,
  useConfirm,
} from 'erxes-ui';
import { useAtom } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePermissionCheck } from 'ui-modules';
import { STRUCTURE_TYPES_MANAGE_ACTION } from '../../constants/structureCapabilities';
import { useStructureEntityTypeMutations } from '../../hooks/useStructureEntityMutations';
import { useStructureEntityTypesList } from '../../hooks/useStructureEntityTypesList';
import { useStructureFeedback } from '../../hooks/useStructureFeedback';
import { useStructureTypeDialogs } from '../../hooks/useStructureTypeDialogs';
import { structureNodeTypesOpenState } from '../../states/structureViewState';
import { IStructureEntityTypeDetail } from '../../types/structureEntity';
import { StructureNewTypeDialog } from '../draft/StructureNewTypeDialog';
import { StructureEntityTypeIcon } from '../StructureEntityTypeIcon';

const StructureNodeTypeRow = ({
  type,
  canManage,
}: {
  type: IStructureEntityTypeDetail;
  canManage: boolean;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { openTypeSettings } = useStructureTypeDialogs();
  const { editType, removeType, removing } = useStructureEntityTypeMutations();
  const { success, failure } = useStructureFeedback();
  const { confirm } = useConfirm();
  const removable = canManage && !type.isSystem && !type.entityCount;

  const rename = (value: string) => {
    const name = value.trim();

    if (!name || name === type.name) {
      return;
    }

    editType({
      variables: { _id: type._id, name },
      onCompleted: () => success(t('type-saved', { name })),
      onError: failure,
    });
  };

  const handleRemove = () =>
    confirm({ message: t('remove-type-confirm', { name: type.name }) }).then(
      () =>
        removeType({
          variables: { _id: type._id },
          onCompleted: () => success(t('type-removed', { name: type.name })),
          onError: failure,
        }),
    );

  return (
    <div className="flex items-center gap-2 py-1.5">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <StructureEntityTypeIcon icon={type.icon} className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        {canManage ? (
          <TextField value={type.name} onSave={rename} className="w-full" />
        ) : (
          <span className="truncate px-2 text-sm">{type.name}</span>
        )}
      </div>
      {type.isSystem && <Badge variant="secondary">{t('system')}</Badge>}
      <span className="w-20 shrink-0 text-right text-xs text-muted-foreground">
        {t('node-count-label', { count: type.entityCount ?? 0 })}
      </span>
      <Button
        variant="ghost"
        size="icon"
        aria-label={t('type-settings-of', { name: type.name })}
        title={t('type-settings-of', { name: type.name })}
        onClick={() => openTypeSettings(type._id)}
      >
        <IconSettings />
      </Button>
      {canManage && (
        <Button
          variant="ghost"
          size="icon"
          disabled={!removable || removing}
          aria-label={t('remove-type')}
          title={removable ? t('remove-type') : t('type-in-use')}
          onClick={handleRemove}
        >
          <IconTrash />
        </Button>
      )}
    </div>
  );
};

export const StructureNodeTypesDialog = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const [open, setOpen] = useAtom(structureNodeTypesOpenState);
  const [creating, setCreating] = useState(false);
  const { types, loading, error } = useStructureEntityTypesList();
  const { hasActionPermission } = usePermissionCheck();
  const { openTypeSettings } = useStructureTypeDialogs();
  const canManage = hasActionPermission(STRUCTURE_TYPES_MANAGE_ACTION);

  const renderTypes = () => {
    if (loading) {
      return Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-9 w-full" />
      ));
    }

    if (error) {
      return <p className="text-sm text-destructive">{error.message}</p>;
    }

    if (!types.length) {
      return <p className="text-sm text-muted-foreground">{t('no-types')}</p>;
    }

    return (
      <div className="flex flex-col divide-y">
        {types.map((type) => (
          <StructureNodeTypeRow
            key={type._id}
            type={type}
            canManage={canManage}
          />
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.ContentCombined
        title={t('node-types')}
        description={t('node-types-description')}
        className="max-h-[90vh] overflow-y-auto sm:max-w-xl"
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {t('node-types-description')}
          </p>
          {canManage && (
            <Button size="sm" onClick={() => setCreating(true)}>
              <IconPlus />
              {t('new-type')}
            </Button>
          )}
        </div>
        {renderTypes()}
        <StructureNewTypeDialog
          open={creating}
          onOpenChange={setCreating}
          onCreated={(typeId) => openTypeSettings(typeId)}
        />
      </Dialog.ContentCombined>
    </Dialog>
  );
};
