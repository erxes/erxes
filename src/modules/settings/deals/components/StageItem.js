import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormControl, Button, Tip } from 'modules/common/components';
import { StageItemContainer } from '../styles';
import { PROBABILITY } from '../constants';

const propTypes = {
  stage: PropTypes.object,
  remove: PropTypes.func,
  onChange: PropTypes.func,
  onKeyPress: PropTypes.func
};

class StageItem extends Component {
  render() {
    const { stage, onChange, onKeyPress, remove } = this.props;
    const probabilties = PROBABILITY.ALL;

    return (
      <StageItemContainer key={stage._id}>
        <FormControl
          defaultValue={stage.name}
          type="text"
          placeholder="Stage name"
          onKeyPress={onKeyPress}
          autoFocus
          name="name"
          onChange={onChange.bind(this, stage._id)}
        />

        <FormControl
          defaultValue={stage.probability}
          componentClass="select"
          name="probability"
          onChange={onChange.bind(this, stage._id)}
        >
          {probabilties.map((p, index) => (
            <option key={index} value={p}>
              {p}
            </option>
          ))}
        </FormControl>

        <Tip text="Delete">
          <Button
            btnStyle="link"
            onClick={remove.bind(this, stage._id)}
            icon="close"
          />
        </Tip>
      </StageItemContainer>
    );
  }
}

StageItem.propTypes = propTypes;

export default StageItem;
