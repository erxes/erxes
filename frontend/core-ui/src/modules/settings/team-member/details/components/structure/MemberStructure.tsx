import { ApolloError } from '@apollo/client';
import {
  IconDots,
  IconHierarchy,
  IconLogout,
  IconStar,
} from '@tabler/icons-react';
import {
  Badge,
  Button,
  cn,
  DropdownMenu,
  Empty,
  Label,
  Spinner,
  Switch,
  toast,
  useConfirm,
} from 'erxes-ui';
import { format } from 'date-fns';
import { useAtomValue } from 'jotai';
import { useId, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Can, currentUserState } from 'ui-modules';
import {
  IStructureAccessMember,
  useStructureAccessMembers,
  useStructureAccessMutations,
} from '@/structure-access';
import { useUserDetail } from '@/settings/team-member/hooks/useUserDetail';
import { evictUserStructureMemberships } from '@/settings/team-member/utils/evictUserStructureMemberships';
import {
  getMembershipSeatLabels,
  orderMemberships,
} from '@/settings/team-member/utils/structureMemberships';
import { MemberStructureAddDialog } from './MemberStructureAddDialog';

const formatDate = (value?: string) =>
  value ? format(new Date(value), 'yyyy/MM/dd') : '';

export const MemberStructure = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const { userDetail } = useUserDetail();
  const currentUser = useAtomValue(currentUserState);
  const [showPast, setShowPast] = useState(false);
  const showPastId = useId();
  const userId = userDetail?._id;

  const { members, loading, error } = useStructureAccessMembers({
    userId,
    includeEnded: showPast,
  });
  const {
    editMember,
    endMember,
    loading: saving,
  } = useStructureAccessMutations();
  const { confirm } = useConfirm();

  const ordered = useMemo(() => orderMemberships(members), [members]);
  const active = members.filter(({ isActive }) => isActive !== false);
  const canChange = !!currentUser?.isOwner || currentUser?._id !== userId;

  const onError = (mutationError: ApolloError) =>
    toast({
      title: t('error'),
      description: mutationError.message,
      variant: 'destructive',
    });

  const makePrimary = (member: IStructureAccessMember) =>
    editMember({
      variables: { _id: member._id, isPrimary: true },
      update: (cache) => evictUserStructureMemberships(cache, member.userId),
      onCompleted: () =>
        toast({ title: t('membership-updated'), variant: 'success' }),
      onError,
    });

  const endMembership = (member: IStructureAccessMember) =>
    confirm({
      message: t(
        member.seats?.length
          ? 'confirm-end-membership-with-seats'
          : 'confirm-end-membership',
        { name: member.entity?.title || member.entityId },
      ),
    }).then(() =>
      endMember({
        variables: { _id: member._id },
        update: (cache) => evictUserStructureMemberships(cache, member.userId),
        onCompleted: () =>
          toast({ title: t('membership-ended'), variant: 'success' }),
        onError,
      }),
    );

  if (!userId) {
    return null;
  }

  const renderActions = (member: IStructureAccessMember) => {
    if (!canChange || member.isActive === false) {
      return null;
    }

    return (
      <Can action="structureEntitiesManage">
        <DropdownMenu>
          <DropdownMenu.Trigger asChild>
            <Button
              variant="ghost"
              size="icon"
              disabled={saving}
              aria-label={t('actions')}
            >
              <IconDots />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end">
            {!member.isPrimary && (
              <DropdownMenu.Item onSelect={() => makePrimary(member)}>
                <IconStar />
                {t('make-primary')}
              </DropdownMenu.Item>
            )}
            <DropdownMenu.Separator />
            <DropdownMenu.Item
              className="text-destructive"
              onSelect={() => endMembership(member)}
            >
              <IconLogout />
              {t('end-membership')}
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      </Can>
    );
  };

  const renderMember = (member: IStructureAccessMember) => {
    const isEnded = member.isActive === false;

    return (
      <div
        key={member._id}
        className={cn(
          'flex items-start gap-3 rounded-lg border px-4 py-3',
          isEnded && 'opacity-70',
        )}
      >
        <IconHierarchy className="mt-1 size-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {member.entity?.code && (
              <span className="text-muted-foreground">
                {member.entity.code}
              </span>
            )}
            <span className="truncate font-medium">
              {member.entity?.title || member.entityId}
            </span>
            {member.entity?.type?.name && (
              <Badge variant="secondary" className="font-normal">
                {member.entity.type.name}
              </Badge>
            )}
            {member.isPrimary && (
              <Badge variant="success">{t('primary')}</Badge>
            )}
            {isEnded && <Badge variant="secondary">{t('ended')}</Badge>}
          </div>
          <div className="flex flex-wrap gap-1">
            {getMembershipSeatLabels(member).map((label) => (
              <Badge key={label} variant="info">
                {label}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {formatDate(member.startsAt)} –{' '}
            {member.endsAt ? formatDate(member.endsAt) : t('present')}
          </p>
        </div>
        {renderActions(member)}
      </div>
    );
  };

  const renderContent = () => {
    if (loading && !members.length) {
      return <Spinner containerClassName="py-20" />;
    }

    if (error) {
      return <p className="text-sm text-destructive">{error.message}</p>;
    }

    if (!ordered.length) {
      return (
        <Empty>
          <Empty.Header>
            <Empty.Media variant="icon">
              <IconHierarchy />
            </Empty.Media>
            <Empty.Title>{t('no-memberships')}</Empty.Title>
            <Empty.Description>
              {t('no-memberships-description')}
            </Empty.Description>
          </Empty.Header>
        </Empty>
      );
    }

    return <div className="space-y-2">{ordered.map(renderMember)}</div>;
  };

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Switch
            id={showPastId}
            checked={showPast}
            onCheckedChange={setShowPast}
          />
          <Label htmlFor={showPastId}>{t('show-past')}</Label>
        </div>
        {canChange && (
          <Can action="structureEntitiesManage">
            <MemberStructureAddDialog
              userId={userId}
              excludeIds={active.map(({ entityId }) => entityId)}
              hasPrimary={active.some(({ isPrimary }) => isPrimary)}
            />
          </Can>
        )}
      </div>
      {!canChange && (
        <p className="text-sm text-muted-foreground">
          {t('own-membership-hint')}
        </p>
      )}
      {renderContent()}
    </div>
  );
};
