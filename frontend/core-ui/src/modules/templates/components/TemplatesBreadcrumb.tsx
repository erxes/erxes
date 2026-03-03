import { IconBrandDatabricks, IconCategory } from '@tabler/icons-react';
import { Breadcrumb, Button } from 'erxes-ui';
import { Link } from 'react-router';

export const TemplatesBreadcrumb = () => {
  return (
    <Breadcrumb>
      <Breadcrumb.List className="gap-1">
        <Breadcrumb.Item>
          <Button variant="ghost" asChild>
            <Link to="/templates">
              <IconBrandDatabricks />
              Templates
            </Link>
          </Button>
        </Breadcrumb.Item>

        <Breadcrumb.Item>
          <Button variant="ghost" asChild>
            <Link to="/templates/categories">
              <IconCategory />
              Categories
            </Link>
          </Button>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb>
  );
};
