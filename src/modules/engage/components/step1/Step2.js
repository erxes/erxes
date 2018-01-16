import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { colors } from 'modules/common/styles';
import {
  FormControl,
  ControlLabel,
  FormGroup,
  Icon
} from 'modules/common/components';

const Content = styled.div`
  display: flex;
  height: 100%;
`;

const Flex100 = styled.div`
  flex: 1 100%;
`;

const Divider = styled.div`
  width: 1px;
  background: ${colors.borderPrimary};
  height: 100%;
  margin: 0 10px;
`;

const ContentCenter = styled.div`
  flex: 1 100%;
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
  flex-direction: column;
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
      segment: 0
    };
  }

  changeSegment(segment) {
    this.setState({ segment });
    this.props.changeSegment(segment);
  }

  render() {
    return (
      <Content>
        <Flex100>
          <FormGroup>
            <ControlLabel>Choose segment</ControlLabel>
            <FormControl
              componentClass="select"
              onChange={e => this.changeSegment(e.target.value)}
            >
              {this.props.segments.map(u => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </FormControl>
          </FormGroup>
        </Flex100>
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
