import { Breadcrumb, Button } from 'erxes-ui';
import { Link } from 'react-router-dom';

import { IconClipboard } from '@tabler/icons-react';

export const ProjectBreadCrumb = ({ link }: { link: string }) => {
  return (
    <Breadcrumb.Item>
      <Button variant="ghost" asChild>
        <Link to={link}>
          <IconClipboard />
          Projects
        </Link>
      </Button>
    </Breadcrumb.Item>
  );
};
