import moment from 'moment';
import React from 'react';
import styled from 'styled-components';
import { colors } from '../styles';
import Tip from './Tip';

type Props = {
  text: string;
  date: Date;
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

function TextDivider({ text, date }: Props) {
  return (
    <Divider>
      <span>
        {text}
        <Tip text={moment(date).format('lll')}>
          <footer>{moment(date).format('LT')}</footer>
        </Tip>
      </span>
    </Divider>
  );
}

export default TextDivider;
