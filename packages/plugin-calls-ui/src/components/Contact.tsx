import Icon from '@erxes/ui/src/components/Icon';
import NameCard from '@erxes/ui/src/components/nameCard/NameCard';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import { AdditionalDetail, InputBar, ContactItem, Contacts } from '../styles';
import { all } from '../constants';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';
import { FormControl } from '@erxes/ui/src/components/form';
import { router } from '@erxes/ui/src/utils';
import { EmptyState } from '@erxes/ui/src/components';

type Props = {
  history?: any;
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
    if (!all || all.length === 0) {
      return <EmptyState icon="ban" text="There is no contact" size="small" />;
    }

    return all.map((item, i) => {
      return (
        <ContactItem key={i}>
          <NameCard
            user={item}
            key={i}
            avatarSize={40}
            secondLine={item.details.operatorPhone}
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
    const { history } = this.props;
    let timer;

    const search = e => {
      if (timer) {
        clearTimeout(timer);
      }

      const inputValue = e.target.value;

      this.setState({ searchValue: inputValue });

      timer = setTimeout(() => {
        router.setParams(history, { searchValue: inputValue });
      }, 500);
    };

    return (
      <>
        <InputBar type="searchBar">
          <Icon icon="search-1" size={20} />
          <FormControl
            placeholder={__('Search')}
            name="searchValue"
            onChange={search}
            value={searchValue}
            autoFocus={true}
          />
        </InputBar>
        <Contacts>{this.renderContact()}</Contacts>
      </>
    );
  }
}

export default Contact;
