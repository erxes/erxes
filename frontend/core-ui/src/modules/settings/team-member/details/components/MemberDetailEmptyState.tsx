import { Empty } from 'erxes-ui';
import { IconCloudExclamation } from '@tabler/icons-react';

export const MemberDetailEmptyState = () => {
  return (
    <div className="flex items-center justify-center h-full">
      <Empty>
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconCloudExclamation />
          </Empty.Media>
          <Empty.Title>Member not found</Empty.Title>
          <Empty.Description>
            There seems to be no member with this ID.
          </Empty.Description>
        </Empty.Header>
      </Empty>
    </div>
  );
};
