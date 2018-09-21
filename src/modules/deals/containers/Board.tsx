import gql from 'graphql-tag';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { Board } from '../components';
import { queries } from '../graphql';
import { IBoard } from '../types';

type Props = {
  pipelinesQuery: any;
}

class BoardContainer extends React.Component<Props> {
  constructor(props) {
    super(props);

    this.move = this.move.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);

    this.state = {};
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

export default compose(
  graphql(gql(queries.pipelines), {
    name: 'pipelinesQuery',
    options: ({ currentBoard }: { currentBoard: IBoard }) => ({
      variables: { boardId: currentBoard ? currentBoard._id : '' }
    })
  })
)(BoardContainer);
