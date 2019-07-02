import React from 'react';
import styled from 'styled-components';

const ActionButton = styled.div`
  display: inline-block;

  * {
    padding: 0;
    margin-left: 10px;

    &:first-child {
      margin-left: 0;
    }
  }
`;

function ActionButtons({ children }: { children: React.ReactNode }) {
  return <ActionButton>{children}</ActionButton>;
}

export default ActionButtons;
