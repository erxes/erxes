import { IconBrandDatabricks, IconCategory } from '@tabler/icons-react';
import { Breadcrumb, Button, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

export const TemplatesBreadcrumb = () => {
  const { t } = useTranslation('templates');
  return (
    <Breadcrumb>
      <Breadcrumb.List className="gap-1">
        <Breadcrumb.Item>
          <Button variant="ghost" asChild>
            <Link to="/templates">
              <IconBrandDatabricks />
              {t('templates', 'Templates')}
            </Link>
          </Button>
        </Breadcrumb.Item>

        <Separator.Inline />

        <Breadcrumb.Item>
          <Button variant="ghost" asChild>
            <Link to="/templates/categories">
              <IconCategory />
              {t('categories', 'Categories')}
            </Link>
          </Button>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb>
  );
};
