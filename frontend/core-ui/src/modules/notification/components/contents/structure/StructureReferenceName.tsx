import { useDepartmentDetailsById } from '@/settings/structure/hooks/useDepartmentDetailsById';
import { usePositionDetailsById } from '@/settings/structure/hooks/usePositionDetailsById';
import { Spinner } from 'erxes-ui';
import { useMemberInline } from 'ui-modules';

const UnavailableReference = () => (
  <span className="text-muted-foreground">Unavailable</span>
);

export const StructureUserName = ({ userId }: { userId?: string }) => {
  const { userDetail, loading } = useMemberInline({
    variables: { _id: userId },
    skip: !userId,
  });

  if (!userId) return null;
  if (loading) return <Spinner size="sm" />;

  return (
    <span>
      {userDetail?.details?.fullName || userDetail?.email || (
        <UnavailableReference />
      )}
    </span>
  );
};

export const StructureDepartmentName = ({
  departmentId,
}: {
  departmentId?: string;
}) => {
  const { departmentDetail, loading } = useDepartmentDetailsById({
    variables: { id: departmentId },
  });

  if (!departmentId) return null;
  if (loading) return <Spinner size="sm" />;

  return departmentDetail?.title || <UnavailableReference />;
};

export const StructurePositionName = ({
  positionId,
}: {
  positionId?: string;
}) => {
  const { positionDetail, loading } = usePositionDetailsById({
    variables: { id: positionId },
  });

  if (!positionId) return null;
  if (loading) return <Spinner size="sm" />;

  return positionDetail?.title || <UnavailableReference />;
};
