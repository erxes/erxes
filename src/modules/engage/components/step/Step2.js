import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { colors } from 'modules/common/styles';
import { FormControl, Icon } from 'modules/common/components';
import { FlexItem, Show, Divider } from './Style';
import Segments from '../Segments';
import SegmentsForm from '../../containers/SegmentsForm';

const RadioContainer = styled.div`
  border-bottom: 1px dotted ${colors.borderPrimary};
  > * {
    padding: 20px;
  }
`;
const SegmentContainer = styled.div`
  padding: 15px;
`;

const propTypes = {
  changeSegment: PropTypes.func,
  segments: PropTypes.array,
  counts: PropTypes.object,
  segmentPush: PropTypes.func
};

class Step2 extends Component {
  constructor(props) {
    super(props);

    this.state = {
      segment: '',
      createSegment: false
    };

    this.changeSegment = this.changeSegment.bind(this);
    this.segmentPush = this.segmentPush.bind(this);
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

  segmentPush(segment) {
    this.props.segmentPush(segment);
    this.setState({ segment: segment._id });
    this.createSegment(false);
  }

  render() {
    const show = this.state.createSegment;
    let segments = '';
    if (!show) {
      segments = (
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
              defaultChecked={true}
            >
              Choose segment
            </FormControl>
            <FormControl
              componentClass="radio"
              onChange={() => this.createSegment(true)}
              name="createSegment"
              checked={this.state.createSegment === true}
              value={true}
            >
              Create segment
            </FormControl>
          </RadioContainer>
          {segments}
          <Show show={show}>
            <SegmentsForm segmentPush={this.segmentPush} />
          </Show>
        </FlexItem>
        <Divider />
        <FlexItem direction="column" v="center" h="center">
          <Icon icon="pie-graph" size={50} />
          <p>{this.props.counts[this.state.segment] || 0} customers</p>
        </FlexItem>
      </FlexItem>
    );
  }
}

Step2.propTypes = propTypes;

export default Step2;
