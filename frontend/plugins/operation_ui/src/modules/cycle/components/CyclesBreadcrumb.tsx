import { Breadcrumb, Button } from 'erxes-ui';
import { IconRestore } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

export const CyclesBreadcrumb = ({ link }: { link: string }) => {
  return (
    <Breadcrumb.Item>
      <Button variant="ghost" asChild>
        <Link to={link}>
          <IconRestore />
          Cycles
        </Link>
      </Button>
    </Breadcrumb.Item>
  );
};
