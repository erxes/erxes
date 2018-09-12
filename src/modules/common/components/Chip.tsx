import React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { colors } from '../styles';

const closeSize = '20px';
const horizontalSpace = '10px';

const ChipItem = styledTS<{ normal?: boolean }>(styled.span)`
  color: ${colors.colorWhite};
  background: ${colors.colorSecondary};
  padding: 2px ${horizontalSpace};
  margin-right: 5px;
  margin-bottom: 1px;
  text-transform: ${props => (props.normal ? 'none' : 'capitalize')};
  display: inline-block;
  border-radius: ${horizontalSpace};
  padding-right: 30px;
  position: relative;
  line-height: 18px;
`;

const Remove = styled.span`
  position: absolute;
  right: 1px;
  top: 1px;
  cursor: pointer;
  width: ${closeSize};
  height: ${closeSize};
  border-radius: 10px;
  position: absolute;
  text-align: center;
  line-height: ${closeSize};
  background: rgba(0, 0, 0, 0.1);
  padding: 0;

  &:hover {
    background: rgba(0, 0, 0, 0.2);
  }

  i {
    margin: 0;
    font-size: 10px;
  }
`;

function Chip(props: { normal?: boolean, onClickClose: () => void, children: React.ReactNode }) {
  const { normal, onClickClose, children } = props;

  return (
    <ChipItem normal={normal}>
      {children}
      <Remove onClick={onClickClose}>×</Remove>
    </ChipItem>
  );
}

export default Chip;