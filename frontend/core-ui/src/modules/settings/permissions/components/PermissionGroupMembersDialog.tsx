import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import {
  Avatar,
  Button,
  Checkbox,
  Dialog,
  Select,
  Spinner,
  Table,
  toast,
} from 'erxes-ui';
import { useGetPermissionGroups } from '@/settings/permissions/hooks/useGetPermissionGroups';
import { useGetPermissionGroupMembers } from '@/settings/permissions/hooks/useGetPermissionGroupMembers';
import { useMovePermissionGroupMembers } from '@/settings/permissions/hooks/useMovePermissionGroupMembers';
import {
  IPermissionGroup,
  IPermissionGroupMember,
} from '@/settings/permissions/types';

const PER_PAGE = 10;

const memberName = (member: IPermissionGroupMember) =>
  member.details?.fullName ||
  [member.details?.firstName, member.details?.lastName]
    .filter(Boolean)
    .join(' ') ||
  member.email;

export const PermissionGroupMembersDialog = ({
  group,
  open,
  onOpenChange,
  onDelete,
}: {
  group: IPermissionGroup;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'permissions' });
  const [page, setPage] = useState(1);
  const [allSelected, setAllSelected] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [excludedIds, setExcludedIds] = useState<string[]>([]);
  const [targetGroupId, setTargetGroupId] = useState('');

  const { members, totalCount, loading } = useGetPermissionGroupMembers({
    groupId: group._id,
    page,
    perPage: PER_PAGE,
    skip: !open,
  });
  const { permissionGroups } = useGetPermissionGroups({ skip: !open });
  const { movePermissionGroupMembers, loading: moving } =
    useMovePermissionGroupMembers();

  const targetGroups = permissionGroups.filter(
    (permissionGroup) => permissionGroup._id !== group._id,
  );
  const pageCount = Math.max(Math.ceil(totalCount / PER_PAGE), 1);
  const selectedCount = allSelected
    ? totalCount - excludedIds.length
    : selectedIds.length;

  const resetSelection = () => {
    setAllSelected(false);
    setSelectedIds([]);
    setExcludedIds([]);
  };

  const isChecked = (id: string) =>
    allSelected ? !excludedIds.includes(id) : selectedIds.includes(id);

  const toggleMember = (id: string) => {
    const update = (ids: string[]) =>
      ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id];

    if (allSelected) {
      setExcludedIds(update);
    } else {
      setSelectedIds(update);
    }
  };

  const toggleAll = (checked: boolean) => {
    resetSelection();
    setAllSelected(checked);
  };

  const handleMove = () => {
    movePermissionGroupMembers({
      variables: {
        fromGroupId: group._id,
        toGroupId: targetGroupId,
        ...(allSelected
          ? { excludeUserIds: excludedIds }
          : { userIds: selectedIds }),
      },
      onCompleted: (data) => {
        toast({
          title: t('members-moved', {
            count: data?.permissionGroupMoveMembers?.count ?? selectedCount,
          }),
          variant: 'success',
        });
        resetSelection();
        setPage(1);
      },
      onError: (error) => {
        toast({
          title: t('error-moving-members'),
          variant: 'destructive',
          description: error.message,
        });
      },
    });
  };

  const getHeaderChecked = (): boolean | 'indeterminate' => {
    if (allSelected && excludedIds.length === 0) {
      return true;
    }

    return selectedCount > 0 ? 'indeterminate' : false;
  };

  const renderMembers = () => {
    if (loading && !members.length) {
      return <Spinner containerClassName="py-10" />;
    }

    if (!totalCount) {
      return null;
    }

    return (
      <div className="flex flex-col gap-2">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head className="w-10">
                <Checkbox
                  checked={getHeaderChecked()}
                  onCheckedChange={(checked) => toggleAll(checked === true)}
                  aria-label={t('select-all-members')}
                />
              </Table.Head>
              <Table.Head>{t('name')}</Table.Head>
              <Table.Head>{t('email')}</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {members.map((member) => (
              <Table.Row key={member._id}>
                <Table.Cell>
                  <Checkbox
                    checked={isChecked(member._id)}
                    onCheckedChange={() => toggleMember(member._id)}
                    aria-label={memberName(member)}
                  />
                </Table.Cell>
                <Table.Cell>
                  <span className="flex items-center gap-2">
                    <Avatar size="lg">
                      <Avatar.Image src={member.details?.avatar} />
                      <Avatar.Fallback>
                        {memberName(member).charAt(0)}
                      </Avatar.Fallback>
                    </Avatar>
                    <span className="truncate">{memberName(member)}</span>
                  </span>
                </Table.Cell>
                <Table.Cell className="text-muted-foreground truncate">
                  {member.email}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{t('members-selected', { count: selectedCount })}</span>
          <span className="flex items-center gap-2">
            {t('page-of', { page, pageCount })}
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
            >
              <IconChevronLeft size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              disabled={page >= pageCount}
              onClick={() => setPage((current) => current + 1)}
            >
              <IconChevronRight size={16} />
            </Button>
          </span>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-2xl">
        <Dialog.Header>
          <Dialog.Title>{t('move-members-title')}</Dialog.Title>
          <Dialog.Description>
            {totalCount > 0
              ? t('move-members-description', {
                  name: group.name,
                  count: totalCount,
                })
              : t('move-members-empty', { name: group.name })}
          </Dialog.Description>
        </Dialog.Header>

        {renderMembers()}

        <Dialog.Footer className="sm:justify-between gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {t('close')}
          </Button>
          {totalCount > 0 ? (
            <span className="flex items-center gap-2">
              <Select value={targetGroupId} onValueChange={setTargetGroupId}>
                <Select.Trigger className="w-56">
                  <Select.Value placeholder={t('select-target-group')} />
                </Select.Trigger>
                <Select.Content>
                  {targetGroups.map((targetGroup) => (
                    <Select.Item key={targetGroup._id} value={targetGroup._id}>
                      {targetGroup.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
              <Button
                disabled={!targetGroupId || selectedCount === 0 || moving}
                onClick={handleMove}
              >
                {moving ? <Spinner size="sm" /> : t('move')}
              </Button>
            </span>
          ) : (
            <Button variant="destructive" onClick={onDelete}>
              {t('delete')}
            </Button>
          )}
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
