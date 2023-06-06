import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { FlexItem } from '@erxes/ui/src/components/step/styles';
import { CAMPAIGN_TARGET_TYPES } from '@erxes/ui-engage/src/constants';
import { SelectMessageType } from '@erxes/ui-engage/src/styles';
import React from 'react';
import BrandStep from '../../containers/BrandStep';
import SegmentStep from '../../containers/SegmentStep';
import TagStep from '../../containers/TagStep';

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

    if (messageType !== CAMPAIGN_TARGET_TYPES.SEGMENT) {
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
              { value: 'contacts:lead', label: 'Leads' },
              { value: 'contacts:customer', label: 'Customers' },
              { value: 'contacts:company', label: 'Company contacts' },
              { value: 'cards:deal', label: 'Deal contacts' },
              { value: 'cards:task', label: 'Task contacts' },
              { value: 'cards:ticket', label: 'Ticket contacts' },
              { value: 'cards:purchase', label: 'Purchase contacts' }
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
      label: opt.split(':')[1]
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
      case CAMPAIGN_TARGET_TYPES.BRAND:
        Component = BrandStep;
        break;
      case CAMPAIGN_TARGET_TYPES.TAG:
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
      segmentType: this.state.segmentType,
      renderContent: args => this.renderContent(args)
    };

    const Component = this.stepComponent();

    return <Component {...commonProps} />;
  }
}

export default MessageTypeStep;
