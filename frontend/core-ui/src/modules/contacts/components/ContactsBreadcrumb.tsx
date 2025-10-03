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

export const ContactsBreadcrumb = () => {
  const { pathname } = useLocation();
  const { sessionKey } = useIsCustomerLeadSessionKey();
  const setCursor = useSetAtom(recordTableCursorAtomFamily(sessionKey));

  return (
    <>
      <Breadcrumb>
        <Breadcrumb.List className="gap-1">
          <Breadcrumb.Item>
            <Button variant="ghost" asChild>
              <Link to={ContactsPath.Index}>
                <IconBookmarksFilled className="text-accent-foreground" />
                Contacts
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
              <Link to="/contacts/customers">Customers</Link>
            </ToggleGroup.Item>
            <ToggleGroup.Item
              value="/contacts/companies"
              asChild
              onClick={() => setCursor('')}
            >
              <Link to="/contacts/companies">Companies</Link>
            </ToggleGroup.Item>
            <ToggleGroup.Item
              value="/contacts/leads"
              asChild
              onClick={() => setCursor('')}
            >
              <Link to="/contacts/leads">Leads</Link>
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
