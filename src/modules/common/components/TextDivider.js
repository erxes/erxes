import * as React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { colors } from '../styles';

const propTypes = {
  text: PropTypes.string.isRequired
};

const Divider = styled.div`
  text-align: center;
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: ${colors.colorCoreLightGray};
  margin: 20px 0;

  > span {
    margin: 0 20px;
  }

  &:before,
  &:after {
    content: '';
    flex: 1;
    height: 0;
    align-self: center;
    border-bottom: 1px solid ${colors.borderPrimary};
  }
`;

function TextDivider({ text }) {
  return (
    <Divider>
      <span>{text}</span>
    </Divider>
  );
}

TextDivider.propTypes = propTypes;

export default TextDivider;
