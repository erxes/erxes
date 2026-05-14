import { IconAlertCircle } from '@tabler/icons-react';
import { Empty } from 'erxes-ui';
import { useUserDetail } from '../../hooks/useUserDetail';

export const MemberDetailErrorState = () => {
  const { error } = useUserDetail();
  return (
    <div className="flex items-center justify-center h-full">
      <Empty>
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconAlertCircle />
          </Empty.Media>
          <Empty.Title>Error</Empty.Title>
          <Empty.Description>{error?.message}</Empty.Description>
        </Empty.Header>
      </Empty>
    </div>
  );
};
