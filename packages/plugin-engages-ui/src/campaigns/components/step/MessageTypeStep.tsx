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
import { ClientPortalConfig } from '@erxes/plugin-clientportal-ui/src/types';
import { METHODS } from '@erxes/ui-engage/src/constants';

type Props = {
  method?: string;
  clearState: () => void;
  onChange: (
    name: 'brandIds' | 'tagIds' | 'segmentIds' | 'cpId',
    value: string[] | string
  ) => void;
  segmentType?: string;
  segmentIds: string[];
  brandIds: string[];
  tagIds: string[];
  clientPortalGetConfigs?: ClientPortalConfig[];
};

type State = {
  messageType: string;
  segmentType: string;
  cpId?: string;
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
    if (key === 'cpId') {
      this.props.onChange(key, (e.target as HTMLInputElement).value);
    } else {
      this.setState({ [key]: (e.target as HTMLInputElement).value } as any);
    }
    this.props.clearState();
  };

  renderClientPortalSelector() {
    const { clientPortalGetConfigs, method } = this.props;

    if (method !== METHODS.NOTIFICATION) {
      return null;
    }

    const options = clientPortalGetConfigs?.map(item => ({
      value: item._id,
      label: item.name
    }));
    if (!clientPortalGetConfigs || clientPortalGetConfigs.length === 0) {
      return 'No clientportal found';
    }
    return (
      <SelectMessageType>
        <FormGroup>
          <ControlLabel>Choose a clientportal:</ControlLabel>
          <FormControl
            id="cpId"
            defaultValue={clientPortalGetConfigs?.[0]?._id}
            value={this.state.cpId}
            componentClass="select"
            options={options}
            onChange={this.onChange.bind(this, 'cpId')}
          />
        </FormGroup>
      </SelectMessageType>
    );
  }

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
          {this.renderClientPortalSelector()}
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
      cpId: this.state.cpId,
      renderContent: args => this.renderContent(args)
    };

    const Component = this.stepComponent();

    return <Component {...commonProps} />;
  }
}

export default MessageTypeStep;
