import { Breadcrumb, Button } from 'erxes-ui';
import { IconCheckbox } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

export const TaskBreadCrump = ({ link }: { link: string }) => {
  return (
    <Breadcrumb.Item>
      <Button variant="ghost" asChild>
        <Link to={link}>
          <IconCheckbox />
          Tasks
        </Link>
      </Button>
    </Breadcrumb.Item>
  );
};
