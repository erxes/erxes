import { Breadcrumb, Button, IconComponent, Skeleton } from 'erxes-ui';
import { Link, useParams } from 'react-router-dom';
import { useGetCurrentUsersPos } from '../../hooks/useGetCurrentUsersPos';


export const PosBreadCrumb = () => {
  const { posId } = useParams();

  const { pos, loading } = useGetCurrentUsersPos();

  const posItem = pos?.find((pos) => pos._id === posId);

  if (loading) {
    return <Skeleton className="w-12 h-[1lh]" />;
  }

  return (
    <Breadcrumb.Item>
      <Button variant="ghost" asChild>
        <Link to={`/operation/pos/${posItem?._id}`}>
          <IconComponent name={posItem?.icon} />
          {posItem?.name}
        </Link>
      </Button>
    </Breadcrumb.Item>
  );
};
