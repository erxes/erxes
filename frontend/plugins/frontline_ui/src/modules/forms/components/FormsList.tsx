import { ChannelsInline } from '@/inbox/channel/components/ChannelsInline';
import {
  IconCalendarEvent,
  IconCircles,
  IconEdit,
  IconForms,
  IconLabel,
  IconTag,
  IconToggleRight,
  IconUser,
} from '@tabler/icons-react';
import { Cell, ColumnDef } from '@tanstack/react-table';
import {
  Badge,
  DropdownMenu,
  Empty,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
  useMultiQueryState,
} from 'erxes-ui';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MembersInline, SelectTags } from 'ui-modules';
import { useTranslation } from 'react-i18next';
import { useFormsList } from '../hooks/useFormsList';
import { IForm } from '../types/formTypes';
import { FormInstallScript } from './actions/install-form';
import { RemoveForm } from './actions/remove-form';
import { FormToggleStatus } from './actions/toggle-form';
import { FormCommandBar } from './form-page/command-bar/form-command-bar';
import { FormsCreateButton } from './form-page/forms-create';
import { OpenLiveForm } from './actions/open-live-form';
import { OpenSubmissionsAction } from './actions/open-submissions';

export const FormsList = () => {
  const { t } = useTranslation('frontline');
  const { id: channelId } = useParams<{ id: string }>();
  const [{ searchValue, status, tagId }] = useMultiQueryState<{
    searchValue?: string;
    status?: string;
    tagId?: string;
  }>(['searchValue', 'status', 'tagId']);

  const { forms, loading, handleFetchMore, pageInfo } = useFormsList({
    variables: {
      channelId: channelId || undefined,
      searchValue: searchValue || undefined,
      status: status || undefined,
      tagId: tagId || undefined,
    },
  });
  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  if (forms?.length === 0) {
    return (
      <Empty className="bg-sidebar rounded-lg m-3">
        <Empty.Header>
          <Empty.Media>
            <IconForms />
          </Empty.Media>
          <Empty.Title>{t('no-forms-found')}</Empty.Title>
          <Empty.Description>{t('forms-empty-description')}</Empty.Description>
        </Empty.Header>
        <Empty.Content>
          <FormsCreateButton />
        </Empty.Content>
      </Empty>
    );
  }

  return (
    <RecordTable.Provider
      columns={formsColumns as unknown as ColumnDef<IForm>[]}
      data={forms || []}
      className="m-3"
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={forms?.length}
        sessionKey={'forms_cursor'}
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.CursorBackwardSkeleton
              handleFetchMore={handleFetchMore}
            />
            {loading ? (
              <RecordTable.RowSkeleton rows={32} />
            ) : (
              <RecordTable.RowList />
            )}
            <RecordTable.CursorForwardSkeleton
              handleFetchMore={handleFetchMore}
            />
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.CursorProvider>
      <FormCommandBar />
    </RecordTable.Provider>
  );
};

export const FormsMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IForm, unknown>;
}) => {
  const { t } = useTranslation('frontline');
  const { _id, status, code, channelId } = cell.row.original;
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content side="bottom" align="start">
        <FormInstallScript
          formId={code}
          channelId={channelId as string}
          inActionBar={true}
        />
        <DropdownMenu.Item
          onSelect={() => {
            navigate(
              `/settings/frontline/channels/${cell.row.original.channelId}/forms/${cell.row.original._id}`,
            );
          }}
        >
          <IconEdit /> {t('edit')}
        </DropdownMenu.Item>
        <OpenLiveForm formId={_id} channelId={channelId as string} />
        <OpenSubmissionsAction formId={_id} />
        <FormToggleStatus formId={_id} status={status} setOpen={setOpen} />
        <RemoveForm formId={_id} title={cell.row.original.name} />
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

export const MoreColumn: ColumnDef<IForm> = {
  id: 'more',
  size: 30,
  cell: FormsMoreColumnCell,
};

const formsColumns: ColumnDef<IForm>[] = [
  MoreColumn,
  RecordTable.checkboxColumn as ColumnDef<IForm>,
  {
    accessorKey: 'name',
    id: 'name',
    header: () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { t } = useTranslation('frontline');
      return <RecordTable.InlineHead label={t('col-name')} icon={IconLabel} />;
    },
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <Link
            to={`/settings/frontline/channels/${cell.row.original.channelId}/forms/${cell.row.original._id}`}
          >
            <RecordTableInlineCell.Anchor>
              {cell.getValue() as string}
            </RecordTableInlineCell.Anchor>
          </Link>
        </RecordTableInlineCell>
      );
    },
    size: 250,
  },
  {
    accessorKey: 'status',
    id: 'status',
    header: () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { t } = useTranslation('frontline');
      return <RecordTable.InlineHead label={t('status')} icon={IconToggleRight} />;
    },
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <Badge
            variant={cell.getValue() === 'active' ? 'success' : 'secondary'}
          >
            {cell.getValue() as string}
          </Badge>
        </RecordTableInlineCell>
      );
    },
  },
  {
    accessorKey: 'channelId',
    id: 'channelId',
    header: () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { t } = useTranslation('frontline');
      return <RecordTable.InlineHead label={t('channel-label')} icon={IconCircles} />;
    },
    cell: ({ cell }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { t } = useTranslation('frontline');
      return (
        <RecordTableInlineCell>
          <ChannelsInline
            channelIds={[cell.getValue() as string]}
            placeholder={t('no-channel')}
          />
        </RecordTableInlineCell>
      );
    },
  },
  {
    accessorKey: 'tagIds',
    id: 'tagIds',
    header: () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { t } = useTranslation('frontline');
      return <RecordTable.InlineHead label={t('tags')} icon={IconTag} />;
    },
    cell: ({ cell }) => {
      return (
        <SelectTags.InlineCell
          tagType="frontline:form"
          mode="multiple"
          value={cell.getValue() as string[]}
          targetIds={[cell.row.original._id]}
        />
      );
    },
  },

  {
    accessorKey: 'createdUserId',
    id: 'createdUserId',
    header: () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { t } = useTranslation('frontline');
      return <RecordTable.InlineHead label={t('created-by')} icon={IconUser} />;
    },
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <MembersInline memberIds={[cell.getValue() as string]} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    accessorKey: 'createdDate',
    id: 'createdDate',
    header: () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { t } = useTranslation('frontline');
      return <RecordTable.InlineHead label={t('created-at')} icon={IconCalendarEvent} />;
    },
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <RelativeDateDisplay.Value value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
];
