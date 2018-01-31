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
  counts: PropTypes.object
};

class Step2 extends Component {
  constructor(props) {
    super(props);

    this.state = {
      segment: '',
      createSegment: false
    };

    this.changeSegment = this.changeSegment.bind(this);
  }

  createSegment(createSegment) {
    this.setState({ createSegment });
  }

  changeSegment(segment) {
    this.setState({ segment });
    this.props.changeSegment(segment);
  }

  render() {
    const show = this.state.createSegment;

    return (
      <Content>
        <FormContainer>
          <RadioContainer>
            <FormControl
              componentClass="radio"
              onChange={() => this.createSegment(false)}
              name="createSegment"
              value={false}
              defaultChecked={true}
            >
              Choose segment
            </FormControl>
            <FormControl
              componentClass="radio"
              onChange={() => this.createSegment(true)}
              name="createSegment"
              value={true}
            >
              Create segment
            </FormControl>
          </RadioContainer>
          <Show show={show}>
            <SegmentsForm />
          </Show>
          <Show show={!show}>
            <Segments
              segments={this.props.segments}
              onChangeSegments={this.changeSegment}
              counts={this.props.counts}
            />
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
