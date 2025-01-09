import { AdditionalDetail, ContactItem, Contacts, InputBar } from '../styles';
import React, { useState } from 'react';

import Dropdown from '@erxes/ui/src/components/Dropdown';
import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';
import { EmptyState } from '@erxes/ui/src/components';
import { FormControl } from '@erxes/ui/src/components/form';
import Icon from '@erxes/ui/src/components/Icon';
import NameCard from '@erxes/ui/src/components/nameCard/NameCard';
import { __ } from '@erxes/ui/src/utils';

type Props = {
  customers?: any;
  history: any;
  searchCustomer: (searchValue: string) => void;
  changeMainTab: (phoneNumber: string, shiftTab: string) => void;
};

const Contact: React.FC<Props> = ({
  customers,
  history,
  searchCustomer,
  changeMainTab,
}: Props) => {
  const [searchValue, setSearchValue] = useState('');

  const renderContact = () => {
    const onCall = (phoneNumber) => {
      changeMainTab(phoneNumber, 'Keyboard');
    };

    if (!customers || customers.length === 0) {
      return <EmptyState icon="ban" text={__("There is no contact" )}size="small" />;
    }

    return customers.map((customer, i) => {
      return (
        <ContactItem key={i}>
          <NameCard
            user={customer}
            key={i}
            avatarSize={40}
            secondLine={customer.primaryPhone || customer.primaryEmail}
          />
          <AdditionalDetail>
            <Dropdown
              as={DropdownToggle}
              toggleComponent={<Icon icon="ellipsis-v" size={18} />}
            >
              <li key="call" onClick={() => onCall(customer?.primaryPhone)}>
                <Icon icon="outgoing-call" /> {__('Call')}
              </li>
            </Dropdown>
          </AdditionalDetail>
        </ContactItem>
      );
    });
  };

  let timer;

  const onSearch = () => {
    searchCustomer(searchValue);
  };

  const onChange = (e) => {
    if (timer) {
      clearTimeout(timer);
    }

    const inputValue = e.target.value;

    setSearchValue(inputValue);
  };

  return (
    <>
      <InputBar type="searchBar">
        <FormControl
          placeholder={__('Type to search')}
          name="searchValue"
          onChange={onChange}
          value={searchValue}
          autoFocus={true}
        />
        <Icon icon="search-1" size={20} onClick={onSearch} />
      </InputBar>
      <Contacts>{renderContact()}</Contacts>
    </>
  );
};

export default Contact;
