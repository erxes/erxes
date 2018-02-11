import React, { Component } from 'react';
// import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  ActionButtons
  // ModalTrigger,
  // Tip,
  // Button,
  // Icon
} from 'modules/common/components';

const propTypes = {
  pipeline: PropTypes.object.isRequired,
  refetch: PropTypes.func.isRequired
};

class PipelineRow extends Component {
  renderExtraLinks() {
    // const { pipeline, refetch } = this.props;

    // const editTrigger = (
    //   <Button btnStyle="link">
    //     <Tip text="Edit">
    //       <Icon icon="edit" />
    //     </Tip>
    //   </Button>
    // );

    return null;
  }

  render() {
    const { pipeline } = this.props;

    return (
      <tr>
        <td>{pipeline.name}</td>
        <td>
          <ActionButtons>{this.renderExtraLinks()}</ActionButtons>
        </td>
      </tr>
    );
  }
}

PipelineRow.propTypes = propTypes;

export default PipelineRow;
