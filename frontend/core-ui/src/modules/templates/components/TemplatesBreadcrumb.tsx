import { IconBrandDatabricks, IconCategory } from '@tabler/icons-react';
import { Breadcrumb, Button } from 'erxes-ui';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';

export const TemplatesBreadcrumb = ({
  currentPage = 'templates',
}: {
  currentPage?: 'templates' | 'categories';
}) => {
  const { t } = useTranslation('templates', { keyPrefix: 'template' });
  const isCategoryPage = currentPage === 'categories';

  return (
    <Breadcrumb>
      <Breadcrumb.List className="gap-1">
        <Breadcrumb.Item>
          {isCategoryPage ? (
            <Button variant="ghost" asChild>
              <Link to="/templates">
                <IconBrandDatabricks />
                {t('templates')}
              </Link>
            </Button>
          ) : (
            <Breadcrumb.Page className="flex items-center gap-2 px-3 py-1 leading-5 [&_svg]:size-4">
              <IconBrandDatabricks />
              {t('templates')}
            </Breadcrumb.Page>
          )}
        </Breadcrumb.Item>
        {isCategoryPage && (
          <>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
              <Breadcrumb.Page className="flex items-center gap-2 px-3 py-1 leading-5 [&_svg]:size-4">
                <IconCategory />
                {t('categories')}
              </Breadcrumb.Page>
            </Breadcrumb.Item>
          </>
        )}
      </Breadcrumb.List>
    </Breadcrumb>
  );
};
