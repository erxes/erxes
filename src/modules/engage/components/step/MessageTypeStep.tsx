import {
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { FlexItem } from 'modules/common/components/step/styles';
import { __ } from 'modules/common/utils';
import { MESSAGE_TYPES } from 'modules/engage/constants';
import * as React from 'react';
import styled from 'styled-components';
import { BrandStep, SegmentStep, TagsStep } from '../../containers';

type Props = {
  onChange: (
    name: 'brandIds' | 'tagIds' | 'segmentIds',
    value: string[]
  ) => void;
  segmentIds: string[];
  brandIds: string[];
  tagIds: string[];
};

const Select = styled.div`
  margin: 20px;
`;

class MessageTypeStep extends React.Component<Props, { type: string }> {
  state = { type: 'segment' };

  onChange = (e: React.FormEvent<HTMLElement>) => {
    this.setState({ type: (e.target as HTMLInputElement).value });
  };

  renderSelector() {
    return (
      <Select>
        <FormGroup>
          <ControlLabel>Choose a message type:</ControlLabel>
          <FormControl
            id="type"
            value={this.state.type}
            componentClass="select"
            options={MESSAGE_TYPES}
            onChange={this.onChange}
          />
        </FormGroup>
      </Select>
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
    const { segmentIds, brandIds, tagIds, onChange } = this.props;

    const commonProps = {
      renderContent: args => this.renderContent(args),
      onChange
    };

    if (type === 'brand') {
      return <BrandStep {...commonProps} brandIds={brandIds} />;
    }

    if (type === 'tag') {
      return <TagsStep {...commonProps} tagIds={tagIds} />;
    }

    return <SegmentStep {...commonProps} segmentIds={segmentIds} />;
  }
}

export default MessageTypeStep;
