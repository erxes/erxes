import {
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { FlexItem } from 'modules/common/components/step/styles';
import { __ } from 'modules/common/utils';
import { MESSAGE_TYPES } from 'modules/engage/constants';
import { SelectMessageType } from 'modules/engage/styles';
import * as React from 'react';
import { BrandStep, SegmentStep, TagStep } from '../../containers';

type Props = {
  clearState: () => void;
  onChange: (
    name: 'brandIds' | 'tagIds' | 'segmentIds',
    value: string[]
  ) => void;
  segmentIds: string[];
  brandIds: string[];
  tagIds: string[];
};

type State = {
  messageType: string;
};

class MessageTypeStep extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = { messageType: 'segment' };
  }

  onChange = (e: React.FormEvent<HTMLElement>) => {
    this.setState({ messageType: (e.target as HTMLInputElement).value });
    this.props.clearState();
  };

  renderSelector() {
    return (
      <SelectMessageType>
        <FormGroup>
          <ControlLabel>Choose a message type:</ControlLabel>
          <FormControl
            id="messageType"
            value={this.state.messageType}
            componentClass="select"
            options={MESSAGE_TYPES}
            onChange={this.onChange}
          />
        </FormGroup>
      </SelectMessageType>
    );
  }

  renderContent = ({ actionSelector, selectedComponent, customerCounts }) => {
    return (
      <FlexItem>
        <FlexItem direction="column" overflow="auto">
          {this.renderSelector()}
          {actionSelector}
          {selectedComponent}
        </FlexItem>
        <FlexItem direction="column" v="center" h="center">
          {customerCounts}
        </FlexItem>
      </FlexItem>
    );
  };

  stepComponent() {
    let Component;

    switch (this.state.messageType) {
      case 'brand':
        Component = BrandStep;
        break;
      case 'tag':
        Component = TagStep;
        break;
      default:
        Component = SegmentStep;
        break;
    }

    return Component;
  }

  render() {
    const commonProps = {
      ...this.props,
      messageType: this.state.messageType,
      renderContent: args => this.renderContent(args)
    };

    const Component = this.stepComponent();

    return <Component {...commonProps} />;
  }
}

export default MessageTypeStep;
