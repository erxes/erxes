import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, ControlLabel, FormControl } from 'react-bootstrap';

const SelectTopic = ({ topics, defaultValue }) => (
  <FormGroup controlId="selectTopic">
    <ControlLabel>Topic</ControlLabel>

    <FormControl componentClass="select" placeholder="Select Topic" defaultValue={defaultValue}>

      <option />
      {topics.map(topic => <option key={topic._id} value={topic._id}>{topic.title}</option>)}
    </FormControl>
  </FormGroup>
);

SelectTopic.propTypes = {
  topics: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  defaultValue: PropTypes.string,
};

export default SelectTopic;
