import { IconBookmarksFilled } from '@tabler/icons-react';
import { Breadcrumb, buttonVariants } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { ContactsPath } from '../utils/contactDetailPath';

/** Contacts › the open list (› a record's name). */
export const ContactsBreadcrumb = ({ title }: { title?: ReactNode }) => {
  const { pathname } = useLocation();
  const { t } = useTranslation('contact');

  const sections = [
    { path: ContactsPath.Customers, label: t('customers') },
    { path: ContactsPath.Leads, label: t('leads') },
    { path: ContactsPath.Companies, label: t('companies') },
  ];

  const currentSection = sections.find(({ path }) =>
    pathname.startsWith(`${ContactsPath.Index}${path}`),
  );

  return (
    <>
      <Breadcrumb>
        <Breadcrumb.List className="gap-1">
          <Breadcrumb.Item>
            <Link to={ContactsPath.Index} className={buttonVariants({ variant: 'ghost' })}>
              <IconBookmarksFilled />
              {t('core-modules.contacts')}
            </Link>
          </Breadcrumb.Item>
          {currentSection && (
            <>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <Breadcrumb.Page>
                  <Link
                    to={`${ContactsPath.Index}${currentSection.path}`}
                    className={buttonVariants({ variant: 'ghost' })}
                  >
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
                  className="block max-w-64 truncate px-3 py-1 leading-5"
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
