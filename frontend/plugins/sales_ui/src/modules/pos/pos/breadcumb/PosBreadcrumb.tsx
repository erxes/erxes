import { Breadcrumb, Button, Skeleton } from 'erxes-ui';
import { Link, useParams } from 'react-router-dom';
import { IconBuilding } from '@tabler/icons-react';
import { useGetCurrentUsersPos } from '@/pos/hooks/useGetCurrentUsersPos';

export const PosBreadcrumb = () => {
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
          <IconBuilding size={16} />
          {posItem?.name}
        </Link>
      </Button>
    </Breadcrumb.Item>
  );
};
