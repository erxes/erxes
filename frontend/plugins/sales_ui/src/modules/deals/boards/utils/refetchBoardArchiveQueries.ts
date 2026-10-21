import type { ApolloClient } from '@apollo/client';
import { BOARD_ARCHIVE_REFETCH_QUERIES } from '../constants/boardArchive';

const archiveQueries = new Set(BOARD_ARCHIVE_REFETCH_QUERIES);

export const refetchBoardArchiveQueries = (client: ApolloClient<object>) =>
  client.refetchQueries({
    include: 'active',
    onQueryUpdated: ({ options }) => archiveQueries.has(options.query),
  });
