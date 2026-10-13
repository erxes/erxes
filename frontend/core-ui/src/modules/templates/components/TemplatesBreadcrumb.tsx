import { IconBrandDatabricks, IconCategory } from '@tabler/icons-react';
import { Breadcrumb, Button, Separator } from 'erxes-ui';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';

export const TemplatesBreadcrumb = () => {
  const { t } = useTranslation('templates', { keyPrefix: 'template' });

  return (
    <Breadcrumb>
      <Breadcrumb.List className="gap-1">
        <Breadcrumb.Item>
          <Button variant="ghost" asChild>
            <Link to="/templates">
              <IconBrandDatabricks />
              {t('templates')}
            </Link>
          </Button>
        </Breadcrumb.Item>

        <Separator.Inline />

        <Breadcrumb.Item>
          <Button variant="ghost" asChild>
            <Link to="/templates/categories">
              <IconCategory />
              {t('categories')}
            </Link>
          </Button>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb>
  );
};
