import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { FlexItem } from 'modules/common/components/step/styles';
import { CAMPAIGN_TARGET_TYPES } from 'modules/engage/constants';
import { SelectMessageType } from 'modules/engage/styles';
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

    const { brandIds = [], tagIds = [] } = props;

    let messageType: string = CAMPAIGN_TARGET_TYPES.SEGMENT;

    if (brandIds.length > 0) {
      messageType = CAMPAIGN_TARGET_TYPES.BRAND;
    }
    if (tagIds.length > 0) {
      messageType = CAMPAIGN_TARGET_TYPES.TAG;
    }

    this.state = { messageType };
  }

  onChange = (e: React.FormEvent<HTMLElement>) => {
    this.setState({ messageType: (e.target as HTMLInputElement).value });
    this.props.clearState();
  };

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
      renderContent: args => this.renderContent(args)
    };

    const Component = this.stepComponent();

    return <Component {...commonProps} />;
  }
}

export default MessageTypeStep;
