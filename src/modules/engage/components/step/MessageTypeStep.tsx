import {
  ControlLabel,
  FormControl,
  FormGroup,
  Icon
} from 'modules/common/components';
import { FlexItem } from 'modules/common/components/step/styles';
import { __ } from 'modules/common/utils';
import { MESSAGE_AUDIENCES } from 'modules/engage/constants';
import * as React from 'react';
import { BrandStep, SegmentStep } from '../../containers';

type Props = {
  onChange: (name: 'brandId' | 'segmentId', value: string) => void;
  segmentId: string;
  brandId: string;
};

type State = {
  type: string;
};

class MessageTypeStep extends React.Component<Props, State> {
  state = { type: 'segment' };

  onSelectorChange = (e: React.FormEvent<HTMLElement>) => {
    this.setState({ type: (e.target as HTMLInputElement).value });
  };

  renderSelector() {
    return (
      <FormGroup>
        <ControlLabel>Choose type:</ControlLabel>
        <FormControl
          id="type"
          value={this.state.type}
          defaultValue="segments"
          componentClass="select"
          options={MESSAGE_AUDIENCES}
          onChange={this.onSelectorChange}
        />
      </FormGroup>
    );
  }

  renderContent = ({ actionSelector, componentContent, customerCounts }) => {
    return (
      <FlexItem>
        <FlexItem direction="column" overflow="auto">
          {this.renderSelector()}
          {actionSelector}
          {componentContent}
        </FlexItem>
        <FlexItem direction="column" v="center" h="center">
          {customerCounts}
        </FlexItem>
      </FlexItem>
    );
  };

  render() {
    const { type } = this.state;
    const { segmentId, brandId, onChange } = this.props;

    const commonProps = {
      renderContent: args => this.renderContent(args),
      onChange
    };

    if (type === 'brand') {
      return <BrandStep {...commonProps} brandId={brandId} />;
    }

    return <SegmentStep {...commonProps} segmentId={segmentId} />;
  }
}

export default MessageTypeStep;
