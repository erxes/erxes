import { useLazyQuery } from '@apollo/client';
import { GET_CONVERSATION_EXPORT } from '@/report/graphql/queries/getChart';

export interface ConversationExportItem {
  _id: string;
  createdAt: string;
  status: string;
  assigneeName: string;
  lastRespondedBy: string;
  openedBy: string;
  content: string;
}

interface ConversationExportResponse {
  reportConversationExport: ConversationExportItem[];
}

export const useConversationExport = () => {
  const [fetchExport, { loading, error }] =
    useLazyQuery<ConversationExportResponse>(GET_CONVERSATION_EXPORT, {
      fetchPolicy: 'network-only',
    });

  return { fetchExport, loading, error };
};
