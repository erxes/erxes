import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormControl, Button, Tip } from 'modules/common/components';

const propTypes = {
  stage: PropTypes.object,
  remove: PropTypes.func
};

class StageItem extends Component {
  remove(_id) {
    this.props.remove(_id);
  }

  render() {
    const stage = this.props.stage;

    return (
      <div>
        <FormControl
          defaultValue={stage.name}
          type="text"
          placeholder="Stage name"
        />
        <Tip text="Delete">
          <Button
            btnStyle="link"
            onClick={this.remove.bind(this, stage._id)}
            icon="close"
          />
        </Tip>
      </div>
    );
  }
}

StageItem.propTypes = propTypes;

export default StageItem;
