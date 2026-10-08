import { Breadcrumb, Button, Separator } from 'erxes-ui';

import { ContactsPath } from '@/types/paths/ContactsPath';
import { Link, useLocation } from 'react-router-dom';
import { IconBookmarksFilled } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

export const ContactsBreadcrumb = () => {
  const { pathname } = useLocation();
  const { t } = useTranslation('contact');

  const sections = [
    { path: ContactsPath.Customers, label: t('customers') },
    { path: ContactsPath.Leads, label: t('leads') },
    { path: ContactsPath.Companies, label: t('companies') },
    {
      path: ContactsPath.ClientPortalUsers,
      label: t('client-portal-users', 'Client Portal Users'),
    },
  ];
  const currentSection = sections.find(({ path }) =>
    pathname.startsWith(`${ContactsPath.Index}${path}`),
  );

  return (
    <>
      <Breadcrumb>
        <Breadcrumb.List className="gap-1">
          <Breadcrumb.Item>
            <Button variant="ghost" asChild>
              <Link to={ContactsPath.Index}>
                <IconBookmarksFilled className="text-accent-foreground" />
                {t('core-modules.contacts')}
              </Link>
            </Button>
          </Breadcrumb.Item>
          {currentSection && (
            <>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <Breadcrumb.Page>{currentSection.label}</Breadcrumb.Page>
              </Breadcrumb.Item>
            </>
          )}
        </Breadcrumb.List>
      </Breadcrumb>
      <Separator.Inline />
    </>
  );
};
