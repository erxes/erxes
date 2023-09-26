import React from 'react';
import styled from 'styled-components';
import colors from '../styles/colors';

export const ActionButton = styled.div`
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

  button {
    &:focus {
      outline: none !important;
    }
  }
`;

function ActionButtons({ children }: { children: React.ReactNode }) {
  return <ActionButton>{children}</ActionButton>;
}

ActionButtons.ActionButton = ActionButton;

export default ActionButtons;
