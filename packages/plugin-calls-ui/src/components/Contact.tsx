import Icon from '@erxes/ui/src/components/Icon';
import NameCard from '@erxes/ui/src/components/nameCard/NameCard';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import { AdditionalDetail, InputBar, ContactItem, Contacts } from '../styles';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';
import { FormControl } from '@erxes/ui/src/components/form';
import { EmptyState } from '@erxes/ui/src/components';

type Props = {
  customers?: any;
  history: any;
  searchCustomer: (searchValue: string) => void;
};

type State = {
  searchValue: string;
};

class Contact extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      searchValue: ''
    };
  }

  renderContact = () => {
    const { customers } = this.props;
    if (!customers || customers.length === 0) {
      return <EmptyState icon="ban" text="There is no contact" size="small" />;
    }

    return customers.map((customer, i) => {
      return (
        <ContactItem key={i}>
          <NameCard
            user={customer}
            key={i}
            avatarSize={40}
            secondLine={customer.primaryPhone}
          />
          <AdditionalDetail>
            <Dropdown>
              <Dropdown.Toggle as={DropdownToggle} id="dropdown-convert-to">
                <Icon icon="ellipsis-v" size={18} />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <li key="call">
                  <Icon icon="outgoing-call" /> {__('Call')}
                </li>
                <li key="delete">
                  <Icon icon="trash-alt" size={14} /> {__('Delete')}
                </li>
              </Dropdown.Menu>
            </Dropdown>
          </AdditionalDetail>
        </ContactItem>
      );
    });
  };

  render() {
    const { searchValue } = this.state;
    const { searchCustomer } = this.props;
    let timer;

    const onSearch = () => {
      searchCustomer(this.state.searchValue);
    };

    const onChange = e => {
      if (timer) {
        clearTimeout(timer);
      }

      const inputValue = e.target.value;

      this.setState({ searchValue: inputValue });
    };

    return (
      <>
        <InputBar type="searchBar">
          <FormControl
            placeholder={__('Search')}
            name="searchValue"
            onChange={onChange}
            value={searchValue}
            autoFocus={true}
          />
          <Icon icon="search-1" size={20} onClick={onSearch} />
        </InputBar>
        <Contacts>{this.renderContact()}</Contacts>
      </>
    );
  }
}

export default Contact;
