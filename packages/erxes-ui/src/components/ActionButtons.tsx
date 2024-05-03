import React from 'react';
import styled from 'styled-components';
import colors from '../styles/colors';

export const ActionButton = styled.div`
  display: inline-flex;
  margin-right: 30px;

  * {
    padding: 0;
    margin-left: 8px;
    margin-right: 0;

    &:first-child {
      margin-left: 0;
      padding: 0;
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

ActionButtons.ActionButton = ActionButton;

export default ActionButtons;
