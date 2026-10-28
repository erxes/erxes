import {
  IconDotsVertical,
  IconEdit,
  IconPlus,
  IconUserMinus,
} from '@tabler/icons-react';
import {
  Badge,
  Button,
  cn,
  DropdownMenu,
  Label,
  Skeleton,
  Switch,
  useConfirm,
} from 'erxes-ui';
import { format } from 'date-fns';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IStructureAccessMember,
  useStructureAccessMembers,
  useStructureAccessMutations,
} from '@/structure-access';
import { useStructureFeedback } from '../../hooks/useStructureFeedback';
import { useStructureMembershipSync } from '../../hooks/useStructureMembershipSync';
import { IStructureEntityDetail } from '../../types/structureEntity';
import { toStructureDragPerson } from '../../utils/structureDrop';
import { StructurePersonChip } from '../dnd/StructurePersonChip';
import { StructureMemberDialog } from './StructureMemberDialog';

const DATE_FORMAT = 'yyyy/MM/dd';

const formatDate = (value?: string) =>
  value ? format(new Date(value), DATE_FORMAT) : '';

const StructureMemberRow = ({
  member,
  editable,
  onEdit,
  onEnd,
}: {
  member: IStructureAccessMember;
  editable: boolean;
  onEdit: (member: IStructureAccessMember) => void;
  onEnd: (member: IStructureAccessMember) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const active = member.isActive !== false;

  return (
    <div
      className={cn('flex items-center gap-2 py-1', !active && 'opacity-60')}
    >
      <div className="flex min-w-0 flex-1 flex-col items-start">
        <StructurePersonChip
          dragId={`person:drawer:${member._id}`}
          person={toStructureDragPerson(member)}
          disabled={!editable || !active}
          className="max-w-full text-sm"
        />
        {!active && (
          <span className="pl-8 text-xs text-muted-foreground">
            {t('member-period', {
              start: formatDate(member.startsAt),
              end: formatDate(member.endsAt),
            })}
          </span>
        )}
      </div>
      <div className="flex max-w-[55%] flex-wrap justify-end gap-1">
        {member.isPrimary && active && (
          <Badge variant="info">{t('primary')}</Badge>
        )}
        {(member.seats ?? []).map((seat) => (
          <Badge key={seat._id} variant="secondary">
            {seat.position?.name ?? seat._id}
          </Badge>
        ))}
      </div>
      {editable && active && (
        <DropdownMenu>
          <DropdownMenu.Trigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 shrink-0"
              aria-label={t('actions')}
            >
              <IconDotsVertical />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end">
            <DropdownMenu.Item onSelect={() => onEdit(member)}>
              <IconEdit />
              {t('edit-member')}
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="text-destructive"
              onSelect={() => onEnd(member)}
            >
              <IconUserMinus />
              {t('end-membership')}
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      )}
    </div>
  );
};

export const StructureDrawerPeople = ({
  entity,
  editable,
}: {
  entity: IStructureEntityDetail;
  editable: boolean;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const switchId = useId();
  const [showPast, setShowPast] = useState(false);
  const [dialogMember, setDialogMember] = useState<
    IStructureAccessMember | null | undefined
  >(undefined);
  const { members, loading, error } = useStructureAccessMembers({
    entityId: entity._id,
    includeEnded: showPast,
  });
  const { endMember } = useStructureAccessMutations();
  const syncMembership = useStructureMembershipSync();
  const { success, failure } = useStructureFeedback();
  const { confirm } = useConfirm();

  const handleEnd = (member: IStructureAccessMember) =>
    confirm({
      message: t(
        member.seats?.length
          ? 'end-membership-with-seats-confirm'
          : 'end-membership-confirm',
        { name: toStructureDragPerson(member).name },
      ),
    }).then(() =>
      endMember({
        variables: { _id: member._id },
        refetchQueries: ['StructureAccessSeats', 'StructureEntityDetail'],
        onCompleted: () => {
          success(t('membership-ended'));
          syncMembership([entity._id]);
        },
        onError: failure,
      }),
    );

  const renderMembers = () => {
    if (loading && !members.length) {
      return Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} className="h-7 w-full" />
      ));
    }

    if (error) {
      return <p className="text-sm text-destructive">{error.message}</p>;
    }

    if (!members.length) {
      return <p className="text-sm text-muted-foreground">{t('no-people')}</p>;
    }

    return members.map((member) => (
      <StructureMemberRow
        key={member._id}
        member={member}
        editable={editable}
        onEdit={setDialogMember}
        onEnd={handleEnd}
      />
    ));
  };

  return (
    <section className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold">{t('people')}</h3>
        <span className="text-xs text-muted-foreground">
          {entity.memberCount ?? 0}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Switch
            id={switchId}
            checked={showPast}
            onCheckedChange={setShowPast}
          />
          <Label htmlFor={switchId} className="text-xs font-normal">
            {t('show-past')}
          </Label>
        </div>
      </div>
      {renderMembers()}
      {editable && (
        <Button
          variant="ghost"
          size="sm"
          className="self-start text-primary"
          onClick={() => setDialogMember(null)}
        >
          <IconPlus />
          {t('add-person')}
        </Button>
      )}
      {dialogMember !== undefined && (
        <StructureMemberDialog
          entity={entity}
          member={dialogMember}
          onClose={() => setDialogMember(undefined)}
        />
      )}
    </section>
  );
};
