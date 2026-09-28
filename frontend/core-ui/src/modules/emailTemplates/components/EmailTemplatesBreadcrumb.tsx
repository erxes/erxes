import { EmailTemplatePath } from '@/types/paths/EmailTemplatePath';
import { IconMail } from '@tabler/icons-react';
import { Breadcrumb, Button } from 'erxes-ui';
import { Link } from 'react-router';

export const EmailTemplatesBreadcrumb = () => (
  <Breadcrumb>
    <Breadcrumb.List className="gap-1">
      <Breadcrumb.Item>
        <Button variant="ghost" asChild>
          <Link to={EmailTemplatePath.Index}>
            <IconMail />
            Email templates
          </Link>
        </Button>
      </Breadcrumb.Item>
    </Breadcrumb.List>
  </Breadcrumb>
);
