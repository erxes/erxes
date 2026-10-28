import { IconArmchair, IconHierarchy, IconTrash } from '@tabler/icons-react';
import { Badge, Button, Empty, Spinner, toast, useConfirm } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Can, currentUserState } from 'ui-modules';
import {
  IStructureAccessSeat,
  StructureSeatCoverageBadge,
  useStructureSeatMutations,
  useStructureSeats,
} from '@/structure-access';
import { MemberSeatDialog } from '@/settings/permissions/components/MemberSeatDialog';
import {
  groupSeatsByNode,
  IStructureSeatNode,
} from '@/settings/permissions/utils/groupSeatsByNode';
import { evictUserStructureMemberships } from '@/settings/team-member/utils/evictUserStructureMemberships';

export const MemberPermission = ({ userId }: { userId: string }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'permissions' });
  const currentUser = useAtomValue(currentUserState);
  const canChange = !!currentUser && currentUser._id !== userId;
  const { seats, loading, error } = useStructureSeats({ userId });
  const { removeHolder, loading: removing } = useStructureSeatMutations();
  const { confirm } = useConfirm();

  const nodes = useMemo(() => groupSeatsByNode(seats), [seats]);

  const positionName = (seat: IStructureAccessSeat) =>
    seat.position?.name ?? seat.positionId;

  const handleRemove = (seat: IStructureAccessSeat) =>
    confirm({
      message: t('confirm-remove-seat', {
        position: positionName(seat),
        node: seat.entity?.title ?? seat.entityId,
      }),
    }).then(() =>
      removeHolder({
        variables: { seatId: seat._id, userId },
        update: (cache) => evictUserStructureMemberships(cache, userId),
        onCompleted: () =>
          toast({ title: t('seat-removed'), variant: 'success' }),
        onError: (mutationError) =>
          toast({
            title: t('error'),
            description: mutationError.message,
            variant: 'destructive',
          }),
      }),
    );

  const renderNodeTitle = ({
    entity,
    entityId,
    isRoot,
  }: IStructureSeatNode) => {
    if (isRoot) {
      return (
        <>
          <span className="font-medium">{t('whole-organization')}</span>
          {entity?.title && (
            <span className="truncate text-muted-foreground">
              {entity.title}
            </span>
          )}
        </>
      );
    }

    return (
      <>
        {entity?.code && (
          <span className="text-muted-foreground">{entity.code}</span>
        )}
        <span className="truncate font-medium">
          {entity?.title || entityId}
        </span>
        {entity?.type?.name && (
          <Badge variant="secondary" className="font-normal">
            {entity.type.name}
          </Badge>
        )}
      </>
    );
  };

  const renderSeat = (seat: IStructureAccessSeat) => (
    <div key={seat._id} className="flex items-center gap-3 px-4 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{positionName(seat)}</p>
        {!!seat.position?.groups?.length && (
          <p className="truncate text-xs text-muted-foreground">
            {seat.position.groups.map(({ name }) => name).join(', ')}
          </p>
        )}
      </div>
      <StructureSeatCoverageBadge seat={seat} />
      {canChange && (
        <Can action="structureEntitiesManage">
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('remove')}
            disabled={removing}
            onClick={() => handleRemove(seat)}
          >
            <IconTrash />
          </Button>
        </Can>
      )}
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return <Spinner containerClassName="py-20" />;
    }

    if (error) {
      return <p className="text-sm text-destructive">{error.message}</p>;
    }

    if (!nodes.length) {
      return (
        <Empty>
          <Empty.Header>
            <Empty.Media variant="icon">
              <IconArmchair />
            </Empty.Media>
            <Empty.Title>{t('no-seats')}</Empty.Title>
            <Empty.Description>
              {canChange ? (
                <Can
                  action="structureEntitiesManage"
                  fallback={t('no-seats-readonly-description')}
                >
                  {t('no-seats-description')}
                </Can>
              ) : (
                t('no-seats-readonly-description')
              )}
            </Empty.Description>
          </Empty.Header>
        </Empty>
      );
    }

    return nodes.map((node) => (
      <section key={node.entityId} className="rounded-lg border">
        <header className="flex items-center gap-2 rounded-t-lg bg-muted/30 px-4 py-2.5 text-sm">
          <IconHierarchy className="size-4 shrink-0 text-muted-foreground" />
          {renderNodeTitle(node)}
        </header>
        <div className="divide-y">{node.seats.map(renderSeat)}</div>
      </section>
    ));
  };

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">{t('held-seats')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('held-seats-description')}
          </p>
        </div>
        {canChange && (
          <Can action="structureEntitiesManage">
            <MemberSeatDialog userId={userId} />
          </Can>
        )}
      </div>
      {renderContent()}
    </div>
  );
};
