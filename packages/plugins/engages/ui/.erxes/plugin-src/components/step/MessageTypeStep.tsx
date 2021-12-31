import FormControl from 'erxes-ui/lib/components/form/Control';
import FormGroup from 'erxes-ui/lib/components/form/Group';
import ControlLabel from 'erxes-ui/lib/components/form/Label';
import { FlexItem } from 'erxes-ui/lib/components/step/styles';
import { CAMPAIGN_TARGET_TYPES } from '../../constants';
import { SelectMessageType } from '../../styles';
import React from 'react';
import SegmentStep from '../../containers/SegmentStep';

type Props = {
  clearState: () => void;
  onChange: (
    name: 'brandIds' | 'tagIds' | 'segmentIds',
    value: string[]
  ) => void;
  segmentType?: string;
  segmentIds: string[];
  brandIds: string[];
  tagIds: string[];
};

type State = {
  messageType: string;
  segmentType: string;
};

class MessageTypeStep extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { brandIds = [], tagIds = [], segmentType } = props;

    let messageType: string = CAMPAIGN_TARGET_TYPES.SEGMENT;

    if (brandIds.length > 0) {
      messageType = CAMPAIGN_TARGET_TYPES.BRAND;
    }
    if (tagIds.length > 0) {
      messageType = CAMPAIGN_TARGET_TYPES.TAG;
    }

    this.state = { messageType, segmentType };
  }

  onChange = (key, e: React.FormEvent<HTMLElement>) => {
    this.setState({ [key]: (e.target as HTMLInputElement).value } as any);
    this.props.clearState();
  };

  renderSegmentType() {
    const { messageType } = this.state;

    if (messageType !== 'segment') {
      return null;
    }

    return (
      <SelectMessageType>
        <FormGroup>
          <ControlLabel>Segment type:</ControlLabel>
          <FormControl
            id="segmentType"
            value={this.state.segmentType}
            componentClass="select"
            options={[
              { value: 'visitor', label: 'Visitors' },
              { value: 'lead', label: 'Leads' },
              { value: 'customer', label: 'Customers' },
              { value: 'company', label: 'Company contacts' },
              { value: 'deal', label: 'Deal contacts' },
              { value: 'task', label: 'Task contacts' },
              { value: 'ticket', label: 'Ticket contacts' }
            ]}
            onChange={this.onChange.bind(this, 'segmentType')}
          />
        </FormGroup>
      </SelectMessageType>
    );
  }

  renderSelector() {
    const options = CAMPAIGN_TARGET_TYPES.ALL.map(opt => ({
      value: opt,
      label: opt.charAt(0).toUpperCase() + opt.slice(1)
    }));

    return (
      <SelectMessageType>
        <FormGroup>
          <ControlLabel>Choose a message type:</ControlLabel>
          <FormControl
            id="messageType"
            value={this.state.messageType}
            componentClass="select"
            options={options}
            onChange={this.onChange.bind(this, 'messageType')}
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
          {this.renderSegmentType()}
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
      segmentType: this.state.segmentType,
      renderContent: args => this.renderContent(args)
    };

    const Component = this.stepComponent();

    return <Component {...commonProps} />;
  }
}

export default MessageTypeStep;
