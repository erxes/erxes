import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import {
  FormControl,
  ControlLabel,
  FormGroup
} from 'modules/common/components';

const Content = styled.div`
  display: flex;
  height: 100%;
`;

const propTypes = {
  changeSegment: PropTypes.func,
  segments: PropTypes.array
};

class Step1 extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Content>
        <FormGroup>
          <ControlLabel>Choose segment</ControlLabel>
          <FormControl
            componentClass="select"
            onChange={this.props.changeSegment}
          >
            {this.props.segments.map(u => (
              <option key={u._id} value={u._id}>
                {u.name}
              </option>
            ))}
          </FormControl>
        </FormGroup>
      </Content>
    );
  }
}

Step1.propTypes = propTypes;

export default Step1;
