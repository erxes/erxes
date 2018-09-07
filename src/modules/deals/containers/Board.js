import * as React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Board } from '../components';
import { queries } from '../graphql';

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

    const extendedProps = {
      ...this.props,
      states: this.state,
      onDragEnd: this.onDragEnd,
      pipelines,
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
