import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'erxes-ui';
import { useParams } from 'react-router-dom';
import { useGetResponse } from '@/responseTemplate/hooks/useGetRespone';
export const ResponseDetailBreadcrumb = () => {
  const { responseId, id } = useParams<{ responseId: string; id: string }>();
  const { response } = useGetResponse(responseId);
  return (
    <Link to={`/settings/frontline/channels/${id}/response/${responseId}`}>
      <Button variant="ghost" className="font-semibold">
        {response?.name}
      </Button>
    </Link>
  );
};
