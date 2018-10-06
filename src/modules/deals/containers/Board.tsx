import gql from 'graphql-tag';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { Board } from '../components';
import { queries } from '../graphql';
import { IBoard } from '../types';
import { DealConsumer, DealProvider } from './DealContext';

type Props = {
  currentBoard?: IBoard;
  pipelinesQuery: any;
};

class BoardContainer extends React.Component<Props> {
  render() {
    const { pipelinesQuery } = this.props;

    const pipelines = pipelinesQuery.dealPipelines || [];

    const extendedProps = {
      ...this.props,
      pipelines,
      loading: pipelinesQuery.loading
    };

    return (
      <DealProvider>
        <DealConsumer>
          {({ states, onDragEnd }) => (
            <Board {...extendedProps} states={states} onDragEnd={onDragEnd} />
          )}
        </DealConsumer>
      </DealProvider>
    );
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
