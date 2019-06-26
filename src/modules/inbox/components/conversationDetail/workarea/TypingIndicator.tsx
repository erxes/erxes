import { colors } from 'modules/common/styles';
import { __ } from 'modules/common/utils';
import { wave } from 'modules/common/utils/animations';
import * as React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  background: ${colors.bgLight};
`;

const Bubble = styled.div`
  display: inline-block;
  margin: 0 20px 10px 20px;
  font-style: italic;
  font-size: 12px;
  word-break: break-word;
  color: ${colors.textSecondary};

  > span {
    margin-right: 8px;
  }
`;

const Indicator = styled.div`
  display: inline-block;
  margin-bottom: 1px;

  span {
    height: 4px;
    width: 4px;
    float: left;
    margin: 0 1px;
    background-color: ${colors.colorCoreGray};
    display: block;
    border-radius: 50%;
    animation-name: ${wave};
    animation-duration: 1.3s;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
  }

  span:nth-of-type(1) {
    animation-delay: 0.2s;
  }

  span:nth-of-type(2) {
    animation-delay: 0.3s;
  }

  span:nth-of-type(3) {
    animation-delay: 0.4s;
  }
`;

export default function TypingIndicator({
  children
}: {
  children?: React.ReactNode;
}) {
  return (
    <Wrapper>
      <Bubble>
        <span>{children}</span>

        <Indicator>
          <span />
          <span />
          <span />
        </Indicator>
      </Bubble>
    </Wrapper>
  );
}
