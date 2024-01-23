import React, { Component } from 'react';
import styled from 'styled-components';
import { isEnabled, readFile } from '@erxes/ui/src/utils/core';
import { Avatar } from '@erxes/ui/src/components/SelectWithSearch';
import { Column } from '@erxes/ui/src/styles/main';
import { formatStr } from '../../../containers/utils';

export const MailSuggestionContainer = styled.div`
  margin-top: 5px;
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  width: 100%;
  overflow: hidden;
  background-color: white;
  border: none;
  border-radius: 0.25rem;
  box-shadow: 0 5px 15px 1px rgba(0, 0, 0, 0.15);
  z-index: 10;
  padding: 5px 0;
  outline: none;
`;

export const MailSuggestionItem = styled.div`
  display: flex;
  padding: 8px 14px;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  p {
    margin: 0;
  }
  &:hover {
    background-color: #f0f0f0;
  }
  &.selected {
    background-color: #f1f1f1;
  }
`;

type Props = {
  name: string;
  contacts: any;
  onSelect: (contact: any) => void;
  selectedMailIndex: number;
};

type State = { selectedSuggestionIndex };

class SuggestionBox extends Component<Props, State> {
  state = {
    selectedSuggestionIndex: -1
  };

  renderMailSuggestionsRow(contact: any, index: number) {
    const { selectedMailIndex } = this.props;
    const { fullName, primaryEmail, avatar } = contact;

    return (
      <MailSuggestionItem
        key={index}
        onMouseDown={e => {
          e.preventDefault();
          this.props.onSelect(contact);
        }}
        className={`${index === selectedMailIndex ? 'selected' : ''}`}
      >
        <Avatar
          src={avatar ? readFile(avatar, 40) : '/images/avatar-colored.svg'}
        />
        <Column>
          <p>{fullName}</p>
          <p>{primaryEmail}</p>
        </Column>
      </MailSuggestionItem>
    );
  }

  render() {
    const { contacts } = this.props;

    if (contacts.length === 0) {
      return null;
    }

    return (
      <MailSuggestionContainer>
        {contacts.map((contact, index) =>
          this.renderMailSuggestionsRow(contact, index)
        )}
      </MailSuggestionContainer>
    );
  }
}

export default SuggestionBox;
