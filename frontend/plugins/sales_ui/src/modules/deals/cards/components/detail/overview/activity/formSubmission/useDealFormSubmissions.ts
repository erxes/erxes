import { useQuery } from '@apollo/client';
import { GET_DEAL_FORM_SUBMISSIONS } from './graphql';

export interface ISubmissionItem {
  _id: string;
  formFieldId: string;
  formFieldText?: string;
  formFieldType?: string;
  text?: string;
  value?: unknown;
  submittedAt?: string;
}

export interface IDealFormSubmission {
  _id: string;
  customerId?: string;
  contentTypeId?: string;
  createdAt?: string;
  formId?: string;
  submissions: ISubmissionItem[];
}

type QueryResult = {
  formSubmissions: { list: IDealFormSubmission[]; totalCount: number };
};

/**
 * Loads the form submission(s) that produced a converted deal.
 *
 * A submission is linked to a deal through two possible keys, so we query both
 * and merge:
 *  - the deal's customer (`customerId`) — always stored on a submission, so this
 *    covers historical data, and
 *  - the originating conversation (`contentTypeIds` = the deal's
 *    `sourceConversationIds`) — covers submissions saved with the conversation
 *    link.
 */
export const useDealFormSubmissions = ({
  customerId,
  contentTypeIds,
}: {
  customerId?: string;
  contentTypeIds?: string[];
}) => {
  const byCustomer = useQuery<QueryResult>(GET_DEAL_FORM_SUBMISSIONS, {
    variables: { customerId, limit: 20 },
    skip: !customerId,
    fetchPolicy: 'cache-and-network',
  });

  const byConversation = useQuery<QueryResult>(GET_DEAL_FORM_SUBMISSIONS, {
    variables: { contentTypeIds, limit: 20 },
    skip: !contentTypeIds?.length,
    fetchPolicy: 'cache-and-network',
  });

  const merged = new Map<string, IDealFormSubmission>();
  [
    ...(byCustomer.data?.formSubmissions.list || []),
    ...(byConversation.data?.formSubmissions.list || []),
  ].forEach((submission) => {
    if (submission?._id) merged.set(submission._id, submission);
  });

  return {
    submissions: Array.from(merged.values()),
    loading: byCustomer.loading || byConversation.loading,
    error: byCustomer.error || byConversation.error,
  };
};
