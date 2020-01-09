import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { IPipeline, WatchMutation, WatchVariables } from 'modules/boards/types';
import { Alert, withProps } from 'modules/common/utils';
import * as React from 'react';
import { graphql } from 'react-apollo';
import PipelineWatch from '../components/PipelineWatch';
import { mutations, queries } from '../graphql';

type IProps = {
  pipeline: IPipeline;
  type: string;
};

type FinalProps = {
  watchMutation: WatchMutation;
} & IProps;

class WatchContainer extends React.Component<FinalProps> {
  render() {
    const onChangeWatch = (isAdd: boolean) => {
      const {
        watchMutation,
        pipeline: { _id },
        type
      } = this.props;

      watchMutation({ variables: { _id, isAdd, type } })
        .then(() => {
          Alert.success('You successfully changed');
        })
        .catch(error => {
          Alert.error(error.message);
        });
    };

    const updatedProps = {
      ...this.props,
      onChangeWatch
    };

    return <PipelineWatch {...updatedProps} />;
  }
}

export default withProps<IProps>(
  compose(
    graphql<IProps, WatchMutation, WatchVariables>(
      gql(mutations.pipelinesWatch),
      {
        name: 'watchMutation',
        options: ({ pipeline }: { pipeline: IPipeline }) => ({
          refetchQueries: [
            {
              query: gql(queries.pipelineDetail),
              variables: { _id: pipeline._id }
            }
          ]
        })
      }
    )
  )(WatchContainer)
);
