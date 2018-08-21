import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Board } from '../components';
import { queries } from '../graphql';

import { STORAGE_PIPELINE_KEY } from 'modules/common/constants';

class BoardContainer extends React.Component {
  constructor(props) {
    super(props);

    this.move = this.move.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);

    this.state = {};
  }

  getChildContext() {
    return { move: this.move };
  }

  move({ source, destination, itemId, type }) {
    this.setState({
      // remove from list
      [`${type}State${source._id}`]: {
        type: 'removeItem',
        index: source.index
      }
    });

    this.setState({
      // add to list
      [`${type}State${destination._id}`]: {
        type: 'addItem',
        index: destination.index,
        itemId
      }
    });
  }

  onDragEnd(result) {
    const { type, destination, source, draggableId } = result;

    // dropped outside the list
    if (!destination) return;

    this.move({
      source: { _id: source.droppableId, index: source.index },
      destination: { _id: destination.droppableId, index: destination.index },
      itemId: draggableId,
      type
    });
  }

  render() {
    const { pipelinesQuery } = this.props;

    const pipelines = pipelinesQuery.dealPipelines || [];

    // get pipeline expanding settings from localStorage
    const expandConfig =
      JSON.parse(localStorage.getItem(STORAGE_PIPELINE_KEY)) || {};

    // if storagePipeline is empty object, default settings will work
    if (Object.keys(expandConfig).length === 0) {
      if (pipelines[0]) expandConfig[pipelines[0]._id] = true;
      if (pipelines[1]) expandConfig[pipelines[1]._id] = true;

      localStorage.setItem(STORAGE_PIPELINE_KEY, JSON.stringify(expandConfig));
    }

    const extendedProps = {
      ...this.props,
      states: this.state,
      onDragEnd: this.onDragEnd,
      pipelines,
      expandConfig,
      loading: pipelinesQuery.loading
    };

    return <Board {...extendedProps} />;
  }
}

BoardContainer.propTypes = {
  pipelinesQuery: PropTypes.object
};

BoardContainer.childContextTypes = {
  move: PropTypes.func
};

export default compose(
  graphql(gql(queries.pipelines), {
    name: 'pipelinesQuery',
    options: ({ currentBoard }) => ({
      variables: { boardId: currentBoard ? currentBoard._id : '' }
    })
  })
)(BoardContainer);
