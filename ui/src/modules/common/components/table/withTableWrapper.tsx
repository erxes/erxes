import { SimpleButton } from 'modules/common/styles/main';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Icon from '../Icon';
import Tip from '../Tip';

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

    const renderExpandButton = () => {
      return (
        <Tip
          text={isExpand ? 'Shrink table row' : 'Expand table row'}
          placement="bottom"
        >
          <SimpleButton isActive={isExpand} onClick={toggleExpand}>
            <Icon icon={isExpand ? 'merge' : 'split'} size={14} />
          </SimpleButton>
        </Tip>
      );
    };

    const updatedProps = {
      ...props,
      renderExpandButton,
      isExpand
    };

    return <Component {...updatedProps} />;
  };

  return Container;
};

withTableWrapper.Wrapper = ContactsTableWrapper;

export default withTableWrapper;
