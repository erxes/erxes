import { Link, useParams } from 'react-router-dom';
import { Button } from 'erxes-ui';

export const MembersBreadcrumb = () => {
  const { id } = useParams<{ id: string }>();
  return (
    <Link to={`/settings/frontline/channels/${id}/members`}>
      <Button variant="ghost" className="font-semibold">
        Members
      </Button>
    </Link>
  );
};
