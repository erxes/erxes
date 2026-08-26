import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  IconDots,
  IconEdit,
  IconGripVertical,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import {
  Badge,
  Button,
  cn,
  Collapsible,
  DropdownMenu,
  EnumCursorDirection,
  RecordTable,
  Spinner,
  useConfirm,
} from 'erxes-ui';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useAtom, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Can, IField, useFields } from 'ui-modules';
import { useFieldGroupRemove } from '../../hooks/useFieldGroupRemove';
import { activePropertyState } from '../../states/activePropertyState';
import { needsToRefreshState } from '../../states/needsToRefresh';
import { IFieldGroup } from '../../types/Properties';
import { propertiesColumns } from './PropertiesColumns';
import { PropertiesRow } from './PropertiesRow';

const PropertiesGroupActions = ({
  group,
  contentType,
}: {
  group: IFieldGroup;
  contentType: string;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const { removeFieldGroup, loading } = useFieldGroupRemove({ contentType });
  const setActivePropertyGroup = useSetAtom(activePropertyState);
  const { confirm } = useConfirm();

  const handleDeleteFieldGroup = () => {
    confirm({
      message: t(
        'confirm-delete-group',
        'Are you sure you want to delete this field group?',
      ),
    }).then(() => removeFieldGroup(group._id));
  };

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <IconDots />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        className="min-w-48"
        onClick={(e) => e.stopPropagation()}
      >
        <Can action="fieldsManage">
          <DropdownMenu.Item asChild>
            <Link to={`/settings/properties/${contentType}/${group._id}/add`}>
              <IconPlus />
              {t('add-field', 'Add field')}
            </Link>
          </DropdownMenu.Item>
        </Can>
        <Can action="fieldGroupsManage">
          <DropdownMenu.Item onClick={() => setActivePropertyGroup(group)}>
            <IconEdit />
            {t('edit', 'Edit')}
          </DropdownMenu.Item>
        </Can>
        <Can action="fieldGroupsManage">
          <DropdownMenu.Item
            className="text-destructive"
            disabled={loading}
            onClick={handleDeleteFieldGroup}
          >
            {loading ? <Spinner size="sm" /> : <IconTrash />}
            {t('delete', 'Delete')}
          </DropdownMenu.Item>
        </Can>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

export const PropertiesGroupSection = ({
  group,
  contentType,
}: {
  group: IFieldGroup;
  contentType: string;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const navigate = useNavigate();
  const [needsToRefresh, setNeedsToRefresh] = useAtom(needsToRefreshState);
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: group._id });
  const { fields, totalCount, loading, refetch, handleFetchMore, pageInfo } =
    useFields({
      contentType,
      groupId: group._id,
    });

  const [loadMoreRef] = useInView({
    onChange(inView) {
      if (inView) {
        handleFetchMore({ direction: EnumCursorDirection.FORWARD });
      }
    },
  });

  useEffect(() => {
    if (needsToRefresh) {
      refetch();
      setNeedsToRefresh(false);
    }
  }, [needsToRefresh, refetch, setNeedsToRefresh]);

  const [open, setOpen] = useState(true);
  const hasUserToggledRef = useRef(false);

  useEffect(() => {
    if (!loading && !hasUserToggledRef.current) {
      setOpen(totalCount > 0);
    }
  }, [loading, totalCount]);

  const handleOpenChange = (value: boolean) => {
    hasUserToggledRef.current = true;
    setOpen(value);
  };

  const columns = useMemo(
    () =>
      propertiesColumns(t, { contentType, fieldIds: fields.map((f) => f._id) }),
    [t, contentType, fields],
  );

  const handleRowClick = (field: IField) => {
    navigate(
      `/settings/properties/${contentType}/${field.groupId}/${field._id}`,
    );
  };

  return (
    <Collapsible
      ref={setNodeRef}
      className={cn('group', isDragging && 'z-10 opacity-40')}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      open={open}
      onOpenChange={handleOpenChange}
    >
      <div className="relative flex items-center gap-1">
        <Can action="fieldGroupsManage">
          <Button
            variant="ghost"
            size="icon"
            className="size-7 shrink-0 cursor-grab text-muted-foreground"
            aria-label={t('reorder-group', 'Reorder group')}
            {...attributes}
            {...listeners}
          >
            <IconGripVertical />
          </Button>
        </Can>
        <Collapsible.Trigger asChild>
          <Button
            variant="secondary"
            className="w-full justify-start font-medium"
          >
            <Collapsible.TriggerIcon />
            {group.name}
            <Badge variant="secondary" className="ml-1">
              {totalCount}
            </Badge>
          </Button>
        </Collapsible.Trigger>
        <PropertiesGroupActions group={group} contentType={contentType} />
      </div>
      <Collapsible.Content className="pt-2">
        {loading ? (
          <Spinner containerClassName="py-6" />
        ) : fields.length === 0 ? (
          <div className="rounded-md border py-10 text-center text-sm text-muted-foreground">
            {t('no-fields-found', 'No fields found')}
          </div>
        ) : (
          <RecordTable.Provider
            columns={columns}
            data={fields}
            stickyColumns={['more', 'checkbox', 'name']}
            className="rounded-md border"
          >
            <RecordTable.Scroll className="h-auto" viewportClassName="max-h-96">
              <RecordTable>
                <RecordTable.Header />
                <RecordTable.Body>
                  <RecordTable.RowList
                    Row={(props) => (
                      <PropertiesRow {...props} onRowClick={handleRowClick} />
                    )}
                  />
                </RecordTable.Body>
              </RecordTable>
              {pageInfo?.hasNextPage && (
                <div ref={loadMoreRef}>
                  <Spinner containerClassName="py-3" />
                </div>
              )}
            </RecordTable.Scroll>
          </RecordTable.Provider>
        )}
        <div className="flex items-center justify-end mt-2">
          <Can action="fieldsManage">
            <Button variant="secondary" asChild>
              <Link to={`/settings/properties/${contentType}/${group._id}/add`}>
                <IconPlus />
                {t('add-field', 'Add field')}
              </Link>
            </Button>
          </Can>
        </div>
      </Collapsible.Content>
    </Collapsible>
  );
};
