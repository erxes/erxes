import { TICKETS_DETAIL_QUERY_KEY } from '@/ticket/constants';
import { useQueryState } from 'erxes-ui';

export const useTicketDetailSheet = () =>
  useQueryState<string>(TICKETS_DETAIL_QUERY_KEY);