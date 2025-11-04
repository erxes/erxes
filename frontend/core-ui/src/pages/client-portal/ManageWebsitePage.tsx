import { PageContainer, Spinner } from 'erxes-ui';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { CLIENT_PORTAL_GET_CONFIG } from '@/client-portal/graphql/queries';
import { WebsiteForm } from '@/client-portal/components/WebsiteForm';
import { NoWebsiteEmptyState } from '@/client-portal/components/NoWebsiteEmptyState';

export default function ManageWebsitePage() {
  const { id } = useParams<{ id: string }>();

  const { data, loading, error } = useQuery(CLIENT_PORTAL_GET_CONFIG, {
    variables: { _id: id },
    skip: !id,
  });

  const website = data?.clientPortalGetConfig;

  return (
    <PageContainer className="overflow-auto">
      <div className="p-4 space-y-4">
        {loading ? (
          <Spinner />
        ) : error ? (
          <div className="text-sm text-red-600">{error.message}</div>
        ) : !website ? (
          <NoWebsiteEmptyState />
        ) : (
          <WebsiteForm initialConfig={website} />
        )}
      </div>
    </PageContainer>
  );
}
