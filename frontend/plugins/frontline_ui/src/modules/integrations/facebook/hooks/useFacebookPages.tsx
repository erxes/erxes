import { useQuery } from '@apollo/client';
import { isDefined } from 'erxes-ui';
import { GET_FB_PAGES } from '../graphql/queries/fbAccounts';
import { useAtomValue } from 'jotai';
import { selectedFacebookAccountAtom } from '../states/facebookStates';
import { IntegrationType } from '@/types/Integration';
import { useFbIntegrationContext } from '@/integrations/facebook/contexts/FbIntegrationContext';
import type { FacebookGetPagesQuery } from '~/gql/graphql';

export type TFacebookPage = NonNullable<
  NonNullable<FacebookGetPagesQuery['facebookGetPages']>[number]
>;

export const useFacebookPages = (overrideAccountId?: string) => {
  const selectedAccount = useAtomValue(selectedFacebookAccountAtom);
  const accountId = overrideAccountId ?? selectedAccount;
  const { isPost } = useFbIntegrationContext();
  const { data, loading, error } = useQuery(GET_FB_PAGES, {
    variables: accountId
      ? {
          accountId,
          kind: isPost
            ? IntegrationType.FACEBOOK_POST
            : IntegrationType.FACEBOOK_MESSENGER,
        }
      : undefined,
    skip: !accountId,
  });

  const facebookGetPages = data?.facebookGetPages?.filter(isDefined) ?? [];

  return { facebookGetPages, loading, error };
};
