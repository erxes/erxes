import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const ContactsTableWrapper = styled.div`
  td {
    max-width: 250px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .expand {
    tr,
    td {
      white-space: pre-wrap;
    }
  }
`;

const withTableWrapper = (attr, Component) => {
  const Container = props => {
    const [isExpand, setExpand] = useState(
      localStorage.getItem(`isExpand${attr}Table`) === 'true'
        ? true
        : false || false
    );

    const toggleExpand = () => {
      setExpand(!isExpand);
    };

    useEffect(() => {
      localStorage.setItem(`isExpand${attr}Table`, isExpand.toString());
    }, [isExpand]);

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
