import React from 'react';
import styled from 'styled-components';
import ExpandButton from './ExpandButton';

const ContactsTableWrapper = styled.div`
  td {
    max-width: 250px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &.expand {
    tr,
    td {
      white-space: pre-wrap;
    }
  }
`;

type Props = {
  children: React.ReactNode;
};

class TableWrapper extends React.Component<Props> {
  static ExpandButton = ExpandButton;

  render() {
    const isExpand =
      localStorage.getItem('isExpandCompanyTable') === 'true'
        ? true
        : false || false;
    console.log(isExpand);
    return (
      <ContactsTableWrapper className={isExpand ? 'expand' : ''}>
        {this.props.children}
      </ContactsTableWrapper>
    );
  }
}

export default TableWrapper;
