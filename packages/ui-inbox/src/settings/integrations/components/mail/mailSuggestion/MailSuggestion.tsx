import React, { Component, HtmlHTMLAttributes } from 'react';
import FormControl from '@erxes/ui/src/components/form/Control';
import styled from 'styled-components';
import SuggestionBox from './SuggestionBox';
import Recipients from './Recipients';
import { formatStr } from '../../../containers/utils';

export const FieldWrapper = styled.div`
  width: 100%;
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
`;

export const MailColumn = styled.div`
  flex: 1;
  position: relative;
`;

type Props = {
  name: string;
  value: string;
  contacts: any;
  collection: any;
  onChange: () => void;
  onSelect: (contact: any) => void;
  onRemove: (index: number) => void;
};

type State = {
  focus: string;
  selectedMailIndex: number;
};

class MailSuggestion extends Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      focus: '',
      selectedMailIndex: 0
    };
  }

  filteredContact = () => {
    const { contacts, name } = this.props;

    const mailWidget = JSON.parse(
      localStorage.getItem('emailWidgetData') || '{}'
    );

    const mails = formatStr(mailWidget[name]);

    return contacts.filter(contact => !mails.includes(contact.primaryEmail));
  };

  handleKeyDown = e => {
    const { selectedMailIndex } = this.state;
    const { value, collection, onRemove, onSelect } = this.props;
    const contacts = this.filteredContact();

    switch (e.keyCode) {
      case 38: // Handle arrow up key
        if (selectedMailIndex > 0) {
          this.setState({ selectedMailIndex: selectedMailIndex - 1 });
        } else {
          this.setState({ selectedMailIndex: contacts.length - 1 });
        }
        break;
      case 40: // Handle arrow down key
        if (selectedMailIndex < contacts.length - 1) {
          this.setState({ selectedMailIndex: selectedMailIndex + 1 });
        } else {
          this.setState({ selectedMailIndex: 0 });
        }
        break;

      case 13: // Handle enter key
        const contact = contacts[selectedMailIndex];

        if (contact) {
          onSelect(contact);
          this.setState({ selectedMailIndex: 0 });
        }
        break;

      case 8: // Handle backspace key
        if (value.trim() === '') {
          onRemove(collection.length - 1);
        }

        break;
    }
  };

  render() {
    const {
      name,
      value,
      collection,
      onChange,
      onSelect,
      onRemove
    } = this.props;

    const contacts = this.filteredContact();

    return (
      <FieldWrapper>
        <Recipients collection={collection} onRemove={onRemove} />
        <MailColumn>
          <FormControl
            autoComplete="off"
            value={value || ''}
            onChange={onChange}
            name={name}
            onFocus={() => this.setState({ focus: name })}
            onBlur={() => this.setState({ focus: '' })}
            onKeyDown={e => this.handleKeyDown(e)}
            required={name === 'to' ? true : false}
          />
          {this.state.focus === name && (
            <SuggestionBox
              name={name}
              contacts={contacts}
              onSelect={onSelect}
              selectedMailIndex={this.state.selectedMailIndex}
            />
          )}
        </MailColumn>
      </FieldWrapper>
    );
  }
}

export default MailSuggestion;
