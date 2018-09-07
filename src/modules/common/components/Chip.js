import * as React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { colors } from '../styles';

const closeSize = '20px';
const horizontalSpace = '10px';

const ChipItem = styled.span`
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

function Chip({ ...props }) {
  return (
    <ChipItem normal={props.normal}>
      {props.children}
      <Remove onClick={props.onClickClose}>×</Remove>
    </ChipItem>
  );
}

Chip.propTypes = {
  children: PropTypes.node.isRequired,
  onClickClose: PropTypes.func,
  normal: PropTypes.bool
};

export default Chip;
