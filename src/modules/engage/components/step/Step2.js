import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { colors } from 'modules/common/styles';
import { FormControl, Icon } from 'modules/common/components';
import Segments from '../Segments';
import SegmentsForm from '../../containers/SegmentsForm';

const Content = styled.div`
  display: flex;
  height: 100%;
`;

const FormContainer = styled.div`
  flex: 2;
  overflow: auto;
`;

const RadioContainer = styled.div`
  border-bottom: 1px dotted ${colors.borderPrimary};
  > * {
    padding: 20px;
  }
`;

const Divider = styled.div`
  width: 1px;
  background: ${colors.borderPrimary};
  height: 100%;
  margin: 0 10px;
`;

const ContentCenter = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

const Show = styled.div`
  display: ${props => (props.show ? 'block' : 'none')};
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
    this.props.changeSegment(segment);
    console.log(this.state.segment);
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
        <Segments
          segments={this.props.segments}
          changeSegments={this.changeSegment}
          counts={this.props.counts}
          defaultValue={this.state.segment}
        />
      );
    }
    return (
      <Content>
        <FormContainer>
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
        </FormContainer>
        <Divider />
        <ContentCenter>
          <Icon icon="pie-graph" size={50} />
          <p>{this.props.counts[this.state.segment] || 0} segments</p>
        </ContentCenter>
      </Content>
    );
  }
}

Step2.propTypes = propTypes;

export default Step2;
