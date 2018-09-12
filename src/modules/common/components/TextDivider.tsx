import * as React from 'react';
import styled from 'styled-components';
import { colors } from '../styles';

type Props = {
  text: string
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

function TextDivider({ text }: Props) {
  return (
    <Divider>
      <span>{text}</span>
    </Divider>
  );
}

export default TextDivider;
