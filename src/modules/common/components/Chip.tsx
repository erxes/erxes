import React from 'react';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { colors } from '../styles';

const closeSize = '20px';
const horizontalSpace = '10px';

const ChipItem = styledTS<{ capitalize?: boolean; hasSpace: boolean }>(
  styled.span
)`
  color: ${colors.colorWhite};
  background: ${colors.colorSecondary};
  padding: 2px ${horizontalSpace};
  margin: 2px 5px 2px 0;
  text-transform: ${props => (props.capitalize ? 'capitalize' : 'none')};
  display: inline-block;
  border-radius: 11px;
  padding-right: 27px;
  padding-left: ${props => props.hasSpace && '30px'};
  position: relative;
  line-height: 18px;
`;

const Click = styled.span`
  position: absolute;
  right: 1px;
  top: 1px;
  cursor: pointer;
  width: ${closeSize};
  height: ${closeSize};
  border-radius: 10px;
  position: absolute;
  text-align: center;
  line-height: 18px;
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

const Front = styled(Click)`
  left: 1px;
`;

function Chip(props: {
  capitalize?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  frontContent?: React.ReactNode;
}) {
  const { capitalize = false, onClick, children, frontContent } = props;

  return (
    <ChipItem capitalize={capitalize} hasSpace={frontContent ? true : false}>
      {frontContent && <Front>{frontContent}</Front>}
      {children}
      <Click onClick={onClick}>×</Click>
    </ChipItem>
  );
}

export default Chip;
