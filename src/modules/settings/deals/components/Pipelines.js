import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table } from 'modules/common/components';
import { PipelineRow } from '/';

const propTypes = {
  pipelines: PropTypes.array.isRequired,
  refetch: PropTypes.func
};

class Pipelines extends Component {
  renderRow() {
    const { pipelines, refetch } = this.props;

    return pipelines.map(pipeline => (
      <PipelineRow key={pipeline._id} pipeline={pipeline} refetch={refetch} />
    ));
  }

  render() {
    return (
      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>{this.renderRow()}</tbody>
      </Table>
    );
  }
}

Pipelines.propTypes = propTypes;

export default Pipelines;
