import React from 'react';
import styled from 'styled-components';

import KeyPad from './KeyPad';
import { BILL_TYPES, POS_MODES } from '../../../constants';

const KeyBoard = styled.div`
  display: inline-grid;
  justify-content: center;
  grid-auto-flow: row;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(2, 1fr);
  margin-bottom: 30px;
`;

type Props = {
  isPortrait: boolean | undefined;
  isPayment: boolean | undefined;
  onChangeKeyPad: (val: string) => void;
  billType: string;
};

export default class KeyPads extends React.Component<Props> {
  renderKeyPad(key, num) {
    return (
      <KeyPad
        key={key}
        onClick={() => this.props.onChangeKeyPad(num.toString())}
        isPortrait={this.props.isPortrait}
        num={num}
      />
    );
  }

  render() {
    const mode = localStorage.getItem('erxesPosMode') || '';
    const { billType } = this.props;

    if (billType === BILL_TYPES.CITIZEN && mode === POS_MODES.KIOSK) {
      return null;
    }

    return (
      <KeyBoard>
        {Array.from({ length: 9 }, (_, i) => i + 1).map((num, index) =>
          this.renderKeyPad(index, num)
        )}
        {/* {this.renderKeyPad(15, isPayment ? '+' : '.')} */}
        {this.renderKeyPad(0, 0)}
        {this.renderKeyPad(20, '00')}
        {this.renderKeyPad(21, '000')}
        {this.renderKeyPad(16, 'CE')}
        {this.renderKeyPad(17, 'C')}
      </KeyBoard>
    );
  }
}
