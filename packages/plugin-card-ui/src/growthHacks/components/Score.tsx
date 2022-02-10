import FormControl from '@erxes/ui/src/components/form/Control';
import { roundToTwo } from '@erxes/ui/src/utils';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { Flex } from '@erxes/ui/src/styles/main';
import {
  AmountItem,
  Amounts,
  CalculatedAmount,
  ScoreWrapper,
  Text
} from '../styles';

type Props = {
  impact: number;
  ease: number;
  confidence: number;
  reach: number;
  scoringType?: string;
  onChange: (e) => void;
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
  const calculateScore = () => {
    if (type === 'rice') {
      if (e === 0) {
        return 0;
      }

      return roundToTwo((r * i * c) / e);
    }

    if (type === 'ice') {
      return i * c * e;
    }

    // PIE
    return roundToTwo((i + c + e) / 3);
  };

  return <span>{calculateScore()}</span>;
}

class Score extends React.Component<Props> {
  static Amount = Amount;

  renderInput = (text: string, name: string, value: number) => {
    return (
      <AmountItem type={this.props.scoringType}>
        <span>{text}</span>
        <FormControl
          value={value}
          onChange={this.props.onChange}
          name={name}
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
        <Flex>
          {this.renderInput('Reach', 'reach', reach)}
          {this.renderInput('Impact', 'impact', impact)}
          {this.renderInput('Confidence', 'confidence', confidence)}
          {this.renderInput('Effort', 'ease', ease)}
        </Flex>
      );
    }

    if (scoringType === 'ice') {
      return (
        <Flex>
          {this.renderInput('Impact', 'impact', impact)}
          {this.renderInput('Confidence', 'confidence', confidence)}
          {this.renderInput('Ease', 'ease', ease)}
        </Flex>
      );
    }

    return (
      <Flex>
        {this.renderInput('Potential', 'impact', impact)}
        {this.renderInput('Importance', 'confidence', confidence)}
        {this.renderInput('Ease', 'ease', ease)}
        <AmountItem>
          <Text>3</Text>
        </AmountItem>
      </Flex>
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
    const { scoringType, reach, impact, confidence, ease } = this.props;

    return (
      <ScoreWrapper>
        <OverlayTrigger
          trigger="click"
          placement="bottom-end"
          rootClose={true}
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
