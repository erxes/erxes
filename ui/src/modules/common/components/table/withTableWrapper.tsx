import React, { useState } from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const ContactsTableWrapper = styledTS<{ isExpand?: boolean }>(styled.div)`

  background: ${props => props.isExpand && 'red'}
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

const withTableWrapper = Component => {
  const Container = props => {
    const [isExpand, setExpand] = useState(
      localStorage.getItem('isExpandCompanyTable') === 'true'
        ? true
        : false || false
    );

    const toggleExpand = () => {
      setExpand(!isExpand);
    };

    const updatedProps = {
      ...props,
      toggleExpand,
      isExpand
    };

    return <Component {...updatedProps} />;
  };

  return Container;
};

withTableWrapper.Wrapper = ContactsTableWrapper;

export default withTableWrapper;
