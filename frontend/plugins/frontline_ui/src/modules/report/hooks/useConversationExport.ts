import { useLazyQuery } from '@apollo/client';
import { GET_CONVERSATION_EXPORT } from '@/report/graphql/queries/getChart';
import type { ReportConversationExportQuery } from '~/gql/graphql';

export type ConversationExportItem = NonNullable<
  NonNullable<ReportConversationExportQuery['reportConversationExport']>[number]
>;

export const useConversationExport = () => {
  const [fetchExport, { loading, error }] = useLazyQuery(
    GET_CONVERSATION_EXPORT,
    {
      fetchPolicy: 'network-only',
    },
  );

  return { fetchExport, loading, error };
};
