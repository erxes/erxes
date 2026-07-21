import { IconTag } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import { RecordTable } from 'erxes-ui';
import { TFunction } from 'i18next';
import {
  settingsEndDateColumn,
  settingsStartDateColumn,
  settingsStatusBadgeColumn,
} from '~/modules/loyalties/components/LoyaltyCampaignColumnHelpers';
import { AssignmentNameCell } from '../assignment-detail/components/AssignmentNameCell';
import { IAssignment } from '../types/assignmentTypes';
import { assignmentMoreColumn } from './AssignmentMoreColumn';

export const assignmentColumns = (
  t: TFunction<'loyalty'>,
): ColumnDef<IAssignment>[] => [
  assignmentMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<IAssignment>,

  {
    id: 'title',
    accessorKey: 'title',
    header: () => (
      <RecordTable.InlineHead icon={IconTag} label={t('title', 'Title')} />
    ),
    cell: ({ cell }) => {
      return (
        <AssignmentNameCell
          assignment={cell.row.original}
          name={cell.getValue() as string}
        />
      );
    },
    size: 150,
  },
  settingsStartDateColumn<IAssignment>(t),
  settingsEndDateColumn<IAssignment>(t),
  settingsStatusBadgeColumn<IAssignment>(t),
];
