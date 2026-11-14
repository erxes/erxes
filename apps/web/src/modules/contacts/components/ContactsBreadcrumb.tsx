import { IconBookmarksFilled } from '@tabler/icons-react';
import { Breadcrumb, buttonVariants } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { paths } from '~/lib/paths';

/** Contacts › the open list (› a record's name). */
export const ContactsBreadcrumb = ({ title }: { title?: ReactNode }) => {
  const { pathname } = useLocation();
  const { t } = useTranslation('contact');

  const sections = [
    { to: paths.contacts.customers, label: t('customers') },
    { to: paths.contacts.leads, label: t('leads') },
    { to: paths.contacts.companies, label: t('companies') },
  ];

  const currentSection = sections.find(({ to }) => pathname.startsWith(to));

  return (
    <>
      <Breadcrumb>
        <Breadcrumb.List>
          <Breadcrumb.Item>
            <Link to={paths.contacts.customers} className={buttonVariants({ variant: 'ghost' })}>
              <IconBookmarksFilled />
              {t('core-modules.contacts')}
            </Link>
          </Breadcrumb.Item>
          {currentSection && (
            <>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <Breadcrumb.Page>
                  <Link to={currentSection.to} className={buttonVariants({ variant: 'ghost' })}>
                    {currentSection.label}
                  </Link>
                </Breadcrumb.Page>
              </Breadcrumb.Item>
            </>
          )}
          {title && (
            <>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <Breadcrumb.Page
                  variant="text"
                  className="block max-w-64"
                  title={typeof title === 'string' ? title : undefined}
                >
                  {title}
                </Breadcrumb.Page>
              </Breadcrumb.Item>
            </>
          )}
        </Breadcrumb.List>
      </Breadcrumb>
    </>
  );
};
