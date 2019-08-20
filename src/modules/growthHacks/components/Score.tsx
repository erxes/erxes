import FormControl from 'modules/common/components/form/Control';
import React from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import {
  Amount,
  Amounts,
  CalculatedAmount,
  Denominator,
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
};

class Score extends React.Component<Props> {
  calculateScore = () => {
    const { scoringType, reach, impact, confidence, ease } = this.props;
    if (scoringType === 'rice') {
      return (reach * impact * confidence) / ease;
    }

    return impact * confidence * ease;
  };

  renderInput = (name: string, value: number) => {
    return (
      <Amount>
        <span>{name}</span>
        <FormControl
          value={value}
          onChange={this.props.onChange}
          name={name}
          type="number"
          max={10}
        />
      </Amount>
    );
  };

  renderInputs = () => {
    const { reach, impact, confidence, ease, scoringType } = this.props;

    if (scoringType === 'rice') {
      return (
        <>
          <Factor>
            {this.renderInput('reach', reach)}
            {this.renderInput('impact', impact)}
            {this.renderInput('confidence', confidence)}
          </Factor>
          <Denominator>{this.renderInput('ease', ease)}</Denominator>
        </>
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
    return (
      <ScoreWrapper>
        <OverlayTrigger
          trigger="click"
          placement="bottom"
          overlay={this.renderPopover()}
        >
          <CalculatedAmount>{this.calculateScore()}</CalculatedAmount>
        </OverlayTrigger>
      </ScoreWrapper>
    );
  }
}

export default Score;
