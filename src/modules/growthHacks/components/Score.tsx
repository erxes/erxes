import FormControl from 'modules/common/components/form/Control';
import React from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import {
  AmountItem,
  Amounts,
  CalculatedAmount,
  Factor,
  ScoreWrapper
} from '../styles';

type Props = {
  impact: number;
  ease: number;
  confidence: number;
  reach: number;
  scoringType?: string;
  onChange: (e) => void;
  onExited: () => void;
};

function Amount({
  type,
  r,
  i,
  c,
  e
}: {
  type?: string;
  r: number;
  i: number;
  c: number;
  e: number;
}) {
  const roundToTwo = value => {
    if (!value) {
      return 0;
    }

    return Math.round(value * 100) / 100;
  };

  const calculateScore = () => {
    if (type === 'rice') {
      if (e === 0) {
        return 0;
      }

      return roundToTwo((r * i * c) / e);
    }

    return i * c * e;
  };

  return <span>{calculateScore()}</span>;
}

class Score extends React.Component<Props> {
  static Amount = Amount;

  renderInput = (name: string, value: number) => {
    return (
      <AmountItem>
        <span>{name}</span>
        <FormControl
          value={value}
          onChange={this.props.onChange}
          name={name === 'effort' ? 'ease' : name}
          type="number"
          min={0}
          max={10}
        />
      </AmountItem>
    );
  };

  renderInputs = () => {
    const { reach, impact, confidence, ease, scoringType } = this.props;

    if (scoringType === 'rice') {
      return (
        <Factor>
          {this.renderInput('reach', reach)}
          {this.renderInput('impact', impact)}
          {this.renderInput('confidence', confidence)}
          {this.renderInput('effort', ease)}
        </Factor>
      );
    }

    return (
      <Factor>
        {this.renderInput('impact', impact)}
        {this.renderInput('confidence', confidence)}
        {this.renderInput('ease', ease)}
      </Factor>
    );
  };

  renderPopover = () => {
    return (
      <Popover id="score-popover">
        <Amounts>{this.renderInputs()}</Amounts>
      </Popover>
    );
  };

  render() {
    const {
      scoringType,
      reach,
      impact,
      confidence,
      ease,
      onExited
    } = this.props;

    return (
      <ScoreWrapper>
        <OverlayTrigger
          trigger="click"
          placement="bottom"
          rootClose={true}
          onExited={onExited}
          overlay={this.renderPopover()}
        >
          <CalculatedAmount>
            <Amount
              type={scoringType}
              r={reach}
              i={impact}
              c={confidence}
              e={ease}
            />
          </CalculatedAmount>
        </OverlayTrigger>
      </ScoreWrapper>
    );
  }
}

export default Score;
