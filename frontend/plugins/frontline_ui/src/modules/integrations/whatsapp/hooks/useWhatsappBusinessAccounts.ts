import { useQuery } from '@apollo/client';
import { useAtomValue } from 'jotai';
import { GET_WHATSAPP_BUSINESS_ACCOUNTS } from '../graphql/queries/whatsappBusinessAccountQueries';
import {
  selectedWhatsappAccountAtom,
  selectedWhatsappPageAtom,
} from '../states/whatsappStates';
import { IWhatsappBusinessAccount } from '../types/WhatsappTypes';

export const useWhatsappBusinessAccounts = () => {
  const accountId = useAtomValue(selectedWhatsappAccountAtom);
  const pageId = useAtomValue(selectedWhatsappPageAtom);

  const { data, loading, error } = useQuery<{
    whatsappGetBusinessAccounts: IWhatsappBusinessAccount[];
  }>(GET_WHATSAPP_BUSINESS_ACCOUNTS, {
    variables: {
      accountId,
      pageId,
    },
    skip: !accountId || !pageId,
  });

  const { whatsappGetBusinessAccounts = [] } = data || {};

  return { whatsappGetBusinessAccounts, loading, error };
};
