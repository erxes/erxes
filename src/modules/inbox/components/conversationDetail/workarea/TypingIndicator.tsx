import { colors } from 'modules/common/styles';
import { __ } from 'modules/common/utils';
import { blink } from 'modules/common/utils/animations';
import * as React from 'react';
import styled from 'styled-components';

const Indicator = styled.div`
  padding: 13px 18px;
  border-radius: 18px;
  background: ${colors.colorWhite};
  box-shadow: 0 1px 1px 0 ${colors.darkShadow};
  display: inline-block;
  margin-left: 55px;
  margin-top: 5px;
  border-top-left-radius: 2px;
  display: none;

  span {
    height: 8px;
    width: 8px;
    float: left;
    margin: 0 1px;
    background-color: ${colors.colorCoreLightGray};
    display: block;
    border-radius: 50%;
    opacity: 0.5;
    animation-name: ${blink};
    animation-duration: 0.8s;
    animation-timing-function: ease;
    animation-iteration-count: infinite;
  }

  span:nth-of-type(1) {
    animation-delay: 0.3s;
  }

  span:nth-of-type(2) {
    animation-delay: 0.6s;
  }

  span:nth-of-type(3) {
    animation-delay: 0.9s;
  }
`;

export default function TypingIndicator() {
  return (
    <Indicator>
      <span />
      <span />
      <span />
    </Indicator>
  );
}
