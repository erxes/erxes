import {
  IconDotsVertical,
  IconEdit,
  IconPlus,
  IconTrash,
  IconUserPlus,
  IconX,
} from '@tabler/icons-react';
import {
  Avatar,
  Button,
  DropdownMenu,
  readImage,
  Skeleton,
  useConfirm,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IStructureAccessSeat,
  IStructureAccessUser,
  StructureSeatCoverageBadge,
  useStructureSeatMutations,
  useStructureSeats,
} from '@/structure-access';
import { useStructureFeedback } from '../../hooks/useStructureFeedback';
import { useStructureMembershipSync } from '../../hooks/useStructureMembershipSync';
import { IStructureEntityDetail } from '../../types/structureEntity';
import { StructureSeatDialog } from './StructureSeatDialog';
import { StructureSeatHoldersDialog } from './StructureSeatHoldersDialog';

const userName = (user: IStructureAccessUser) =>
  user.details?.fullName || user.email || user._id;

const StructureSeatHolder = ({
  user,
  editable,
  disabled,
  onRemove,
}: {
  user: IStructureAccessUser;
  editable: boolean;
  disabled: boolean;
  onRemove: (user: IStructureAccessUser) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const name = userName(user);

  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-accent py-0.5 pl-0.5 pr-1.5 text-xs">
      <Avatar size="lg">
        <Avatar.Image src={readImage(user.details?.avatar ?? '')} />
        <Avatar.Fallback>{name.charAt(0).toUpperCase()}</Avatar.Fallback>
      </Avatar>
      <span className="truncate">{name}</span>
      {editable && (
        <Button
          variant="ghost"
          size="icon"
          className="size-4 rounded-full"
          disabled={disabled}
          aria-label={t('remove-holder')}
          title={t('remove-holder')}
          onClick={() => onRemove(user)}
        >
          <IconX className="size-3" />
        </Button>
      )}
    </span>
  );
};

const StructureSeatRow = ({
  seat,
  editable,
  disabled,
  onEdit,
  onRemove,
  onAddHolders,
  onRemoveHolder,
}: {
  seat: IStructureAccessSeat;
  editable: boolean;
  disabled: boolean;
  onEdit: (seat: IStructureAccessSeat) => void;
  onRemove: (seat: IStructureAccessSeat) => void;
  onAddHolders: (seat: IStructureAccessSeat) => void;
  onRemoveHolder: (
    seat: IStructureAccessSeat,
    user: IStructureAccessUser,
  ) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const holders = seat.holders ?? [];

  return (
    <div className="flex flex-col gap-1.5 rounded-lg border p-2.5">
      <div className="flex items-center gap-2">
        <span className="min-w-0 flex-1 truncate text-sm font-medium">
          {seat.position?.name ?? seat.positionId}
        </span>
        <StructureSeatCoverageBadge seat={seat} />
        {editable && (
          <DropdownMenu>
            <DropdownMenu.Trigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 shrink-0"
                disabled={disabled}
                aria-label={t('actions')}
              >
                <IconDotsVertical />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end">
              <DropdownMenu.Item onSelect={() => onAddHolders(seat)}>
                <IconUserPlus />
                {t('add-holders')}
              </DropdownMenu.Item>
              <DropdownMenu.Item onSelect={() => onEdit(seat)}>
                <IconEdit />
                {t('edit-coverage')}
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className="text-destructive"
                onSelect={() => onRemove(seat)}
              >
                <IconTrash />
                {t('remove-seat')}
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu>
        )}
      </div>
      <div className="flex flex-wrap gap-1">
        {holders.length === 0 && (
          <span className="text-xs text-muted-foreground">
            {t('no-holders')}
          </span>
        )}
        {holders.map((user) => (
          <StructureSeatHolder
            key={user._id}
            user={user}
            editable={editable}
            disabled={disabled}
            onRemove={(holder) => onRemoveHolder(seat, holder)}
          />
        ))}
        {editable && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 rounded-full px-2 text-xs text-primary"
            disabled={disabled}
            onClick={() => onAddHolders(seat)}
          >
            <IconPlus className="size-3" />
            {t('add-holders')}
          </Button>
        )}
      </div>
    </div>
  );
};

export const StructureDrawerSeats = ({
  entity,
  editable,
}: {
  entity: IStructureEntityDetail;
  editable: boolean;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const [seatDialog, setSeatDialog] = useState<
    IStructureAccessSeat | null | undefined
  >(undefined);
  const [holdersSeat, setHoldersSeat] = useState<IStructureAccessSeat | null>(
    null,
  );
  const { seats, loading, error } = useStructureSeats({
    entityId: entity._id,
  });
  const {
    removeSeat,
    removeHolder,
    loading: saving,
  } = useStructureSeatMutations();
  const syncMembership = useStructureMembershipSync();
  const { success, failure } = useStructureFeedback();
  const { confirm } = useConfirm();

  const handleRemove = (seat: IStructureAccessSeat) =>
    confirm({
      message: t('remove-seat-confirm', {
        position: seat.position?.name ?? seat.positionId,
        count: seat.holderCount ?? 0,
      }),
    }).then(() =>
      removeSeat({
        variables: { _id: seat._id },
        onCompleted: () => {
          success(t('seat-removed'));
          syncMembership([entity._id]);
        },
        onError: failure,
      }),
    );

  const handleRemoveHolder = (
    seat: IStructureAccessSeat,
    user: IStructureAccessUser,
  ) =>
    confirm({
      message: t('remove-holder-confirm', {
        name: userName(user),
        position: seat.position?.name ?? seat.positionId,
      }),
    }).then(() =>
      removeHolder({
        variables: { seatId: seat._id, userId: user._id },
        onCompleted: () => success(t('holder-removed')),
        onError: failure,
      }),
    );

  const renderSeats = () => {
    if (loading) {
      return Array.from({ length: 2 }).map((_, index) => (
        <Skeleton key={index} className="h-16 w-full" />
      ));
    }

    if (error) {
      return <p className="text-sm text-destructive">{error.message}</p>;
    }

    if (!seats.length) {
      return <p className="text-sm text-muted-foreground">{t('no-seats')}</p>;
    }

    return seats.map((seat) => (
      <StructureSeatRow
        key={seat._id}
        seat={seat}
        editable={editable}
        disabled={saving}
        onEdit={setSeatDialog}
        onRemove={handleRemove}
        onAddHolders={setHoldersSeat}
        onRemoveHolder={handleRemoveHolder}
      />
    ));
  };

  return (
    <section className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold">{t('positions')}</h3>
        <span className="text-xs text-muted-foreground">{seats.length}</span>
      </div>
      <p className="text-xs text-muted-foreground">{t('seats-description')}</p>
      {renderSeats()}
      {editable && (
        <Button
          variant="ghost"
          size="sm"
          className="self-start text-primary"
          onClick={() => setSeatDialog(null)}
        >
          <IconPlus />
          {t('add-seat')}
        </Button>
      )}
      {seatDialog !== undefined && (
        <StructureSeatDialog
          entity={entity}
          seat={seatDialog}
          onClose={() => setSeatDialog(undefined)}
        />
      )}
      {holdersSeat && (
        <StructureSeatHoldersDialog
          entity={entity}
          seat={holdersSeat}
          onClose={() => setHoldersSeat(null)}
        />
      )}
    </section>
  );
};
