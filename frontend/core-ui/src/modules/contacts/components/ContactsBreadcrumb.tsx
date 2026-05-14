import {
  Breadcrumb,
  Button,
  recordTableCursorAtomFamily,
  Separator,
  ToggleGroup,
} from 'erxes-ui';

import { ContactsPath } from '@/types/paths/ContactsPath';
import { Link, useLocation } from 'react-router-dom';
import { IconBookmarksFilled } from '@tabler/icons-react';
import { useIsCustomerLeadSessionKey } from '@/contacts/customers/hooks/useCustomerLeadSessionKey';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { CP_USERS_CURSOR_SESSION_KEY } from '@/contacts/client-portal-users/constants/cpUsersCursorSessionKey';

export const ContactsBreadcrumb = () => {
  const { pathname } = useLocation();

  const { t } = useTranslation('contact');
  const { sessionKey } = useIsCustomerLeadSessionKey();
  const setCursor = useSetAtom(recordTableCursorAtomFamily(sessionKey));
  const setCPUsersCursor = useSetAtom(
    recordTableCursorAtomFamily(CP_USERS_CURSOR_SESSION_KEY),
  );

  const handleClientPortalUsersClick = () => {
    setCPUsersCursor('');
  };

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
          <Breadcrumb.Separator />
          <ToggleGroup type="single" value={pathname}>
            <ToggleGroup.Item
              value="/contacts/customers"
              asChild
              onClick={() => setCursor('')}
            >
              <Link to="/contacts/customers">{t('customers')}</Link>
            </ToggleGroup.Item>
            <ToggleGroup.Item
              value="/contacts/companies"
              asChild
              onClick={() => setCursor('')}
            >
              <Link to="/contacts/companies">{t('companies')}</Link>
            </ToggleGroup.Item>
            <ToggleGroup.Item
              value="/contacts/leads"
              asChild
              onClick={() => setCursor('')}
            >
              <Link to="/contacts/leads">{t('leads')}</Link>
            </ToggleGroup.Item>
            <ToggleGroup.Item
              value={`${ContactsPath.Index}${ContactsPath.ClientPortalUsers}`}
              asChild
              onClick={handleClientPortalUsersClick}
            >
              <Link to={`${ContactsPath.Index}${ContactsPath.ClientPortalUsers}`}>
                Client Portal Users
              </Link>
            </ToggleGroup.Item>
            {/* <ToggleGroup.Item
              value="/contacts/clients"
              asChild
              onClick={() => setCursor('')}
            >
              <Link to="/contacts/clients">Clients</Link>
            </ToggleGroup.Item> */}
          </ToggleGroup>
        </Breadcrumb.List>
      </Breadcrumb>
      <Separator.Inline />
    </>
  );
};
