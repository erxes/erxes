import {
  IconBriefcase,
  IconEdit,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import { Badge, Button, Dialog, Skeleton, useConfirm } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IStructureAccessPosition,
  useStructurePositionMutations,
  useStructurePositions,
} from '@/structure-access';
import { useStructureFeedback } from '../../hooks/useStructureFeedback';
import { StructureEmpty } from '../StructureEmpty';
import { StructurePositionDialog } from './StructurePositionDialog';

const StructurePositionRow = ({
  position,
  removing,
  onEdit,
  onRemove,
}: {
  position: IStructureAccessPosition;
  removing: boolean;
  onEdit: (position: IStructureAccessPosition) => void;
  onRemove: (position: IStructureAccessPosition) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const inUse = position.seatCount > 0;

  return (
    <div className="flex items-start gap-3 py-3">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">{position.name}</span>
          <span className="shrink-0 text-xs text-muted-foreground">
            {t('seat-count', { count: position.seatCount })}
          </span>
        </div>
        {position.description && (
          <p className="text-xs text-muted-foreground">
            {position.description}
          </p>
        )}
        <div className="flex flex-wrap gap-1">
          {(position.groups ?? []).length === 0 && (
            <span className="text-xs text-muted-foreground">
              {t('position-has-no-groups')}
            </span>
          )}
          {(position.groups ?? []).map((group) => (
            <Badge key={group._id} variant="secondary">
              {group.name}
            </Badge>
          ))}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('edit-position')}
          title={t('edit-position')}
          onClick={() => onEdit(position)}
        >
          <IconEdit />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          disabled={removing || inUse}
          aria-label={t('remove-position')}
          title={inUse ? t('position-in-use') : t('remove-position')}
          onClick={() => onRemove(position)}
        >
          <IconTrash />
        </Button>
      </div>
    </div>
  );
};

export const StructurePositionsDialog = ({
  onClose,
}: {
  onClose: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const [editing, setEditing] = useState<
    IStructureAccessPosition | null | undefined
  >(undefined);
  const { positions, loading, error } = useStructurePositions();
  const { removePosition, removing } = useStructurePositionMutations();
  const { success, failure } = useStructureFeedback();
  const { confirm } = useConfirm();

  const handleRemove = (position: IStructureAccessPosition) =>
    confirm({
      message: t('remove-position-confirm', { name: position.name }),
    }).then(() =>
      removePosition({
        variables: { _id: position._id },
        onCompleted: () =>
          success(t('position-removed', { name: position.name })),
        onError: failure,
      }),
    );

  const renderPositions = () => {
    if (loading) {
      return Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} className="h-14 w-full" />
      ));
    }

    if (error) {
      return <p className="text-sm text-destructive">{error.message}</p>;
    }

    if (!positions.length) {
      return (
        <StructureEmpty
          icon={IconBriefcase}
          title={t('no-positions')}
          description={t('no-positions-description')}
        />
      );
    }

    return (
      <div className="flex flex-col divide-y">
        {positions.map((position) => (
          <StructurePositionRow
            key={position._id}
            position={position}
            removing={removing}
            onEdit={setEditing}
            onRemove={handleRemove}
          />
        ))}
      </div>
    );
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <Dialog.ContentCombined
        title={t('positions')}
        description={t('positions-description')}
        className="flex max-h-[90vh] flex-col sm:max-w-xl"
      >
        <div className="min-h-0 flex-1 overflow-y-auto styled-scroll">
          {renderPositions()}
        </div>
        <Dialog.Footer className="border-t pt-4 sm:justify-between">
          <Button variant="secondary" onClick={onClose}>
            {t('close')}
          </Button>
          <Button onClick={() => setEditing(null)}>
            <IconPlus />
            {t('add-position')}
          </Button>
        </Dialog.Footer>
      </Dialog.ContentCombined>
      {editing !== undefined && (
        <StructurePositionDialog
          position={editing}
          onClose={() => setEditing(undefined)}
        />
      )}
    </Dialog>
  );
};
