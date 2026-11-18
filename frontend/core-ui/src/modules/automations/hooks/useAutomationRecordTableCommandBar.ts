import { IAutomation } from '@/automations/types';
import { ApolloCache, ApolloError } from '@apollo/client';
import { Row } from '@tanstack/react-table';
import { RecordTable, toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

// Tags every selected automation shares, so the picker shows them as on
const commonItems = (lists: string[][]): string[] => {
  if (!lists.length) {
    return [];
  }

  return lists.reduce((common, current) =>
    common.filter((item) => current.includes(item)),
  );
};

/** The bulk bar over the selected automations: their ids, shared tags, tagging. */
export const useAutomationRecordTableCommandBar = () => {
  const { t } = useTranslation('automations');
  const { table } = RecordTable.useRecordTable();
  const selectedRows: Row<IAutomation>[] =
    table.getFilteredSelectedRowModel().rows;
  const automationIds = selectedRows.map((row) => row.original._id);

  // Writes the new tags into every selected automation's cache entry
  const tagOptions = (newSelectedTagIds: string[]) => ({
    update: (cache: ApolloCache<unknown>) =>
      automationIds.forEach((automationId) =>
        cache.modify({
          id: cache.identify({ __typename: 'Automation', _id: automationId }),
          fields: { tagIds: () => newSelectedTagIds },
        }),
      ),
    onError: (e: ApolloError) =>
      toast({
        title: t('error'),
        description: e.message,
        variant: 'destructive',
      }),
  });

  return {
    selectedRows,
    selectedCount: selectedRows.length,
    isSelected: selectedRows.length > 0,
    automationIds,
    tagIds: commonItems(selectedRows.map((row) => row.original.tagIds || [])),
    tagOptions,
  };
};
