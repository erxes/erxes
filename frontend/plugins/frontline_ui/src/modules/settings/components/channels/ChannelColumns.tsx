/* eslint-disable react-hooks/rules-of-hooks */
import {
  IconAlignJustified,
  IconLabel,
  IconMessageCog,
  IconMessages,
  IconUsersGroup,
} from '@tabler/icons-react';
import { Cell, ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  RecordTableInlineCell,
  Popover,
  Input,
  Textarea,
  TextOverflowTooltip,
  useQueryState,
  toast,
} from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { type TChannel } from '@/settings/types/channel';
import { renderingChannelDetailAtom } from '../../states/renderingChannelDetail';
import { useChannelsEdit } from '../../hooks/useChannelsEdit';
import { useState } from 'react';
import { ApolloError } from '@apollo/client';
import { SelectMember } from 'ui-modules';

export const MoreColumnCell = ({ cell }: { cell: Cell<TChannel, unknown> }) => {
  const [, setOpen] = useQueryState('channel_id');
  const setRenderingChannelDetail = useSetAtom(renderingChannelDetailAtom);
  const { _id } = cell.row.original;
  return (
    <RecordTable.MoreButton
      className="w-full h-full"
      onClick={() => {
        setOpen(_id);
        setRenderingChannelDetail(false);
      }}
    />
  );
};

export const ChannelColumns: ColumnDef<TChannel>[] = [
  {
    id: 'more',
    cell: MoreColumnCell,
    size: 33,
  },
  RecordTable.checkboxColumn as ColumnDef<TChannel>,
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead label="name" icon={IconLabel} />,
    cell: ({ cell }) => {
      const { channelsEdit } = useChannelsEdit();
      const { name, _id } = cell.row.original;
      const [_name, _setName] = useState<string>(name);

      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.currentTarget;
        _setName(value);
      };

      const handleSave = () => {
        if (name === _name) return;
        channelsEdit(
          {
            variables: {
              id: _id,
              name: _name,
            },
            onError: (error: ApolloError) =>
              toast({ title: error.message, variant: 'destructive' }),
            onCompleted: () => toast({ title: 'The name has been updated' }),
          },
          ['name'],
        );
      };
      return (
        <Popover>
          <RecordTableInlineCell.Trigger>
            <TextOverflowTooltip value={_name} />
          </RecordTableInlineCell.Trigger>
          <RecordTableInlineCell.Content>
            <Input value={_name} onChange={handleChange} onBlur={handleSave} />
          </RecordTableInlineCell.Content>
        </Popover>
      );
    },
    size: 250,
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: () => (
      <RecordTable.InlineHead label="description" icon={IconAlignJustified} />
    ),
    cell: ({ cell }) => {
      const { channelsEdit } = useChannelsEdit();
      const { description, name, _id } = cell.row.original;
      const [_description, _setDescription] = useState<string>(description);

      const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { value } = e.currentTarget;
        _setDescription(value);
      };

      const handleSave = () => {
        if (description === _description) return;
        channelsEdit(
          {
            variables: {
              id: _id,
              name,
              description: _description,
            },
            onError: (error: ApolloError) =>
              toast({ title: error.message, variant: 'destructive' }),
            onCompleted: () => toast({ title: 'Description has been updated' }),
          },
          ['description'],
        );
      };

      return (
        <Popover>
          <RecordTableInlineCell.Trigger>
            <TextOverflowTooltip value={_description} />
          </RecordTableInlineCell.Trigger>
          <RecordTableInlineCell.Content>
            <Textarea
              value={_description}
              onChange={handleChange}
              onBlur={handleSave}
            />
          </RecordTableInlineCell.Content>
        </Popover>
      );
    },
    size: 250,
  },
  {
    id: 'memberIds',
    accessorKey: 'memberIds',
    header: () => (
      <RecordTable.InlineHead label="users" icon={IconUsersGroup} />
    ),
    cell: ({ cell }) => {
      const { channelsEdit } = useChannelsEdit();
      const { _id, name, memberIds } = cell.row.original;
      return (
        <SelectMember.InlineCell
          mode="multiple"
          value={memberIds}
          scope={`ChannelsPage.${_id}`}
          onValueChange={(value) =>
            channelsEdit(
              {
                variables: {
                  id: _id,
                  name,
                  memberIds: value,
                },
                onError: (error: ApolloError) =>
                  toast({ title: error.message, variant: 'destructive' }),
                onCompleted: () => toast({ title: 'Users have been updated' }),
              },
              ['memberIds'],
            )
          }
        />
      );
    },
    size: 250,
  },
  {
    id: 'conversationCount',
    accessorKey: 'conversationCount',
    header: () => (
      <RecordTable.InlineHead label="Conversations" icon={IconMessages} />
    ),
    cell: ({ cell }) => (
      <RecordTableInlineCell className="justify-center">
        {cell.getValue() as number}
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'integrationsCount',
    accessorKey: 'integrationIds',
    header: () => (
      <RecordTable.InlineHead label="Integrations" icon={IconMessageCog} />
    ),
    cell: ({ cell }) => {
      const { integrationIds } = cell.row.original || [];
      return (
        <RecordTableInlineCell className="justify-center">
          {integrationIds?.length as number}
        </RecordTableInlineCell>
      );
    },
  },
];
