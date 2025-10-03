import { useQuery } from '@apollo/client';
import {
  GET_INTEGRATIONS,
  GET_INTEGRATION_DETAIL,
  GET_PAGES,
  GET_ACCOUNTS,
} from '../graphql/queries/fbIntegrationQueries';

interface UseFbIntegrationsProps {
  kind?: string;
  erxesApiId?: string;
  accountId?: string;
}

export function useFbIntegrations({
  kind,
  erxesApiId,
  accountId,
}: UseFbIntegrationsProps = {}) {
  const { data: integrationsData, loading: integrationsLoading } = useQuery(
    GET_INTEGRATIONS,
    {
      variables: { kind },
      skip: !kind,
    },
  );

  const { data: detailData, loading: detailLoading } = useQuery(
    GET_INTEGRATION_DETAIL,
    {
      variables: { erxesApiId },
      skip: !erxesApiId,
    },
  );

  const { data: pagesData, loading: pagesLoading } = useQuery(GET_PAGES, {
    variables: { accountId, kind },
    skip: !accountId || !kind,
  });

  const { data: accountsData, loading: accountsLoading } = useQuery(
    GET_ACCOUNTS,
    {
      variables: { kind },
      skip: !kind,
    },
  );

  return {
    integrations: integrationsData?.facebookGetIntegrations || [],
    integrationDetail: detailData?.facebookGetIntegrationDetail,
    pages: pagesData?.facebookGetPages || [],
    accounts: accountsData?.facebookGetAccounts || [],
    loading:
      integrationsLoading || detailLoading || pagesLoading || accountsLoading,
  };
}
