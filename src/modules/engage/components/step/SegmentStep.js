import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { colors } from 'modules/common/styles';
import { FormControl, Icon } from 'modules/common/components';
import { Segments, SegmentsForm } from '../';
import { FlexItem, Show, Divider } from './style';

const RadioContainer = styled.div`
  border-bottom: 1px dotted ${colors.borderPrimary};

  > * {
    padding: 20px;
    fields: PropTypes.array.isRequired;
  }
`;

const SegmentContainer = styled.div`
  padding: 20px;
`;

const CustomerCounts = styled.div`
  text-align: center;

  > i {
    color: ${colors.colorCoreLightGray};
  }
`;

const propTypes = {
  changeSegment: PropTypes.func,
  segments: PropTypes.array,
  headSegments: PropTypes.array,
  segmentFields: PropTypes.array,
  segmentAdd: PropTypes.func,
  counts: PropTypes.object,
  count: PropTypes.func,
  segment: PropTypes.string
};

const contextTypes = {
  __: PropTypes.func
};

class SegmentStep extends Component {
  constructor(props) {
    super(props);

    this.state = {
      segment: props.segment || '',
      createSegment: false
    };

    this.changeSegment = this.changeSegment.bind(this);
    this.createSegment = this.createSegment.bind(this);
  }

  createSegment(createSegment) {
    this.setState({ createSegment });

    if (createSegment === true) {
      this.changeSegment('');
    }
  }

  changeSegment(segment) {
    this.setState({ segment });
    this.props.changeSegment('segment', segment);
  }

  renderSegments(show) {
    if (!show) {
      return (
        <SegmentContainer>
          <Segments
            segments={this.props.segments}
            changeSegments={this.changeSegment}
            counts={this.props.counts}
            defaultValue={this.state.segment}
          />
        </SegmentContainer>
      );
    }
    return null;
  }

  render() {
    const show = this.state.createSegment;
    const { __ } = this.context;

    return (
      <FlexItem>
        <FlexItem direction="column" overflow="auto">
          <RadioContainer>
            <FormControl
              componentClass="radio"
              onChange={() => this.createSegment(false)}
              name="createSegment"
              value={false}
              checked={this.state.createSegment === false}
            >
              {__('Choose segment')}
            </FormControl>
            <FormControl
              componentClass="radio"
              onChange={() => this.createSegment(true)}
              name="createSegment"
              checked={this.state.createSegment === true}
              value={true}
            >
              {__('Create segment')}
            </FormControl>
          </RadioContainer>
          {this.renderSegments(show)}
          <Show show={show}>
            <SegmentsForm
              fields={this.props.segmentFields}
              create={this.props.segmentAdd}
              headSegments={this.props.headSegments}
              count={this.props.count}
              createSegment={this.createSegment}
            />
          </Show>
        </FlexItem>
        <Divider />
        <FlexItem direction="column" v="center" h="center">
          <CustomerCounts>
            <Icon icon="person-stalker" size={50} />
            <p>
              {this.props.counts[this.state.segment] || 0} {__('customers')}
            </p>
          </CustomerCounts>
        </FlexItem>
      </FlexItem>
    );
  }
}

SegmentStep.propTypes = propTypes;
SegmentStep.contextTypes = contextTypes;

export default SegmentStep;
