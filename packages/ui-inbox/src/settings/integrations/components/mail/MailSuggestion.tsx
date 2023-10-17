import React from 'react';
import styled from 'styled-components';
import { Avatar } from '@erxes/ui/src/components/SelectWithSearch';
import { readFile } from '@erxes/ui/src/utils/core';
import { Column } from '@erxes/ui/src/styles/main';
import styledTS from 'styled-components-ts';

const MailSuggestionItem = styledTS<{
  selected?: boolean;
}>(styled.div)`
    display: flex;
    padding: 8px 14px;
    align-items: center;
    gap: 5px;
    cursor: pointer;
    transition: background-color 0.2s ease-in-out;
    background-color: ${props => (props.selected ? '#f1f1f1' : '#fff')}
    overflow: hidden;
    p {
      margin: 0;
      max-width: 200px;
      text-overflow: ellipsis;
    }
  
    &:hover {
      background-color: #f1f1f1;
    }
  `;

const MailSuggestionContainer = styled.div`
  margin-top: 5px;
  position: absolute;
  top: 20px;
  left: 0;
  width: 300px;
  overflow: hidden;
  background-color: #fff;
  border: none;
  border-radius: 0.25rem;
  box-shadow: 0 5px 15px 1px rgba(0, 0, 0, 0.15);
  z-index: 10;
  padding: 5px 0;
  outline: none;
`;

type Props = {
  contacts: any[];
  selectedMailIndex: number;
  onClick: (contact: any) => void;
};

const MailSuggestion = (props: Props) => {
  const { contacts, selectedMailIndex, onClick } = props;

  if (contacts.length === 0) {
    return null;
  }

  const renderMailSuggestionsRow = (contact: any, index: number) => {
    const { fullName, primaryEmail, avatar } = contact;

    return (
      <MailSuggestionItem
        key={index}
        onMouseDown={e => {
          e.preventDefault();
          onClick && onClick(contact);
        }}
        selected={index === selectedMailIndex}
      >
        <Avatar
          src={avatar ? readFile(avatar, 40) : '/images/avatar-colored.svg'}
        />
        <Column>
          {fullName && <p>{fullName}</p>}
          <p>{primaryEmail}</p>
        </Column>
      </MailSuggestionItem>
    );
  };

  return (
    <MailSuggestionContainer>
      {contacts.map((contact, index) =>
        renderMailSuggestionsRow(contact, index)
      )}
    </MailSuggestionContainer>
  );
};

export default MailSuggestion;
