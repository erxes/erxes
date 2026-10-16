import { useLazyQuery } from '@apollo/client';
import { GET_TICKET_EXPORT } from '@/report/graphql/queries/getTicketChart';
import type { ReportTicketExportQuery } from '~/gql/graphql';

export type TicketExportItem = NonNullable<
  NonNullable<ReportTicketExportQuery['reportTicketExport']>[number]
>;

export const useTicketExport = () => {
  const [fetchExport, { loading, error }] = useLazyQuery(GET_TICKET_EXPORT, {
    fetchPolicy: 'network-only',
  });

  return { fetchExport, loading, error };
};
