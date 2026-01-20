import { useQuery } from '@apollo/client';
import {
  GET_INTEGRATIONS,
  GET_INTEGRATION_DETAIL,
  GET_PAGES,
  GET_ACCOUNTS,
} from '../graphql/queries/igIntegrationQueries';

interface UseIgIntegrationsProps {
  kind?: string;
  erxesApiId?: string;
  accountId?: string;
}

export function useIgIntegrations({
  kind,
  erxesApiId,
  accountId,
}: UseIgIntegrationsProps = {}) {
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
    integrations: integrationsData?.instagramGetIntegrations || [],
    integrationDetail: detailData?.instagramGetIntegrationDetail,
    pages: pagesData?.instagramGetPages || [],
    accounts: accountsData?.instagramGetAccounts || [],
    loading:
      integrationsLoading || detailLoading || pagesLoading || accountsLoading,
  };
}
