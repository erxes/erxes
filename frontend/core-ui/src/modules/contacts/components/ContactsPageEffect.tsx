import { useEffect } from 'react';
import { ContactsHotKeyScope } from '@/contacts/types/ContactsHotKeyScope';
import {
  useIsMatchingLocation,
  useQueryState,
  useSetHotkeyScope,
} from 'erxes-ui';
import { ContactsPath } from '@/types/paths/ContactsPath';

export const ContactsPageEffect = () => {
  const isMatchingLocation = useIsMatchingLocation(ContactsPath.Index);
  const [contactId] = useQueryState<string>('contactId');
  const setHotkeyScope = useSetHotkeyScope();

  useEffect(() => {
    switch (true) {
      case isMatchingLocation(ContactsPath.Customers): {
        if (contactId) {
          setHotkeyScope(ContactsHotKeyScope.CustomerEditSheet);
          break;
        }

        setHotkeyScope(ContactsHotKeyScope.CustomersPage);
        break;
      }
      case isMatchingLocation(ContactsPath.Leads): {
        setHotkeyScope(ContactsHotKeyScope.CustomerAddSheet);
        break;
      }
      case isMatchingLocation(ContactsPath.Companies): {
        setHotkeyScope(ContactsHotKeyScope.CustomerAddSheet);
        break;
      }

      case isMatchingLocation(ContactsPath.Vendors): {
        setHotkeyScope(ContactsHotKeyScope.CustomerAddSheet);
        break;
      }

      case isMatchingLocation(ContactsPath.Clients): {
        setHotkeyScope(ContactsHotKeyScope.CustomerAddSheet);
        break;
      }
    }
  }, [isMatchingLocation, setHotkeyScope]);

  return <></>;
};
