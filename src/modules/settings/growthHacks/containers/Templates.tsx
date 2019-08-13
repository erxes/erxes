import gql from 'graphql-tag';
import { PipelinesQueryResponse } from 'modules/boards/types';
import Spinner from 'modules/common/components/Spinner';
import { Alert } from 'modules/common/utils';
import { withProps } from 'modules/common/utils';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import Templates from '../components/Templates';
import { mutations, queries } from '../graphql';

type Props = {
  show: boolean;
  closeModal: () => void;
  boardId: string;
  refetch: any;
};

type FinalProps = {
  templatesQuery: any;
  pipelinesCopyMutation: any;
} & Props;

class PipelinesContainer extends React.Component<FinalProps> {
  render() {
    const { templatesQuery, pipelinesCopyMutation } = this.props;

    if (templatesQuery.loading) {
      return <Spinner />;
    }

    const pipelinesCopy = variables => {
      pipelinesCopyMutation({ variables }).then(({ data }) => {
        Alert.success('You successfully copied');

        this.props.refetch({ boardId: data.pipelinesCopy.boardId });
      });
    };

    const extendedProps = {
      ...this.props,
      pipelinesCopy,
      templates: templatesQuery.growthHackTemplates || []
    };

    return <Templates {...extendedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, PipelinesQueryResponse, { boardId: string }>(
      gql(queries.growthHackTemplates),
      {
        name: 'templatesQuery'
      }
    ),
    graphql(gql(mutations.pipelinesCopy), {
      name: 'pipelinesCopyMutation'
    })
  )(PipelinesContainer)
);
