import React from 'react';
import styled from 'styled-components';
import colors from '../styles/colors';

const ActionButton = styled.div`
  display: inline-block;

  * {
    padding: 0;
    margin-left: 8px;

    &:first-child {
      margin-left: 0;
    }
  }

  i {
    font-size: 16px;
  }

  a {
    color: ${colors.colorCoreGray};
  }
`;

function ActionButtons({ children }: { children: React.ReactNode }) {
  return <ActionButton>{children}</ActionButton>;
}

export default ActionButtons;
