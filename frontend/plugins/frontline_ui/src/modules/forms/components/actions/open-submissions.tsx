import { IconListDetails } from '@tabler/icons-react';
import { DropdownMenu } from 'erxes-ui';
import { FC } from 'react';
import { useNavigate } from 'react-router';

type Props = {
  formId: string;
};
export const OpenSubmissionsAction: FC<Props> = ({ formId }) => {
  const navigate = useNavigate();
  return (
    <DropdownMenu.Item
      title="Open submissions list"
      onSelect={() => navigate(`submissions/${formId}`)}
    >
      <IconListDetails /> Submissions
    </DropdownMenu.Item>
  );
};
