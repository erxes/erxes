import { Link, useParams } from 'react-router-dom';
import { Button } from 'erxes-ui';
import { useGetResponse } from '@/responseTemplate/hooks/useGetRespone';
export const ResponseDetailBreadcrumb = () => {
  const { responseId, id } = useParams<{ responseId: string; id: string }>();
  const { response } = useGetResponse(responseId);
  return (
    <Link to={`/frontline/settings/channels/${id}/response/${responseId}`}>
      <Button variant="ghost">{response?.name}</Button>
    </Link>
  );
};
