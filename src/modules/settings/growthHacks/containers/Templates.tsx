import gql from 'graphql-tag';
import { TemplatesQueryResponse } from 'modules/boards/types';
import Spinner from 'modules/common/components/Spinner';
import { Alert } from 'modules/common/utils';
import { withProps } from 'modules/common/utils';
import {
  PipelineCopyMutation,
  PipelineCopyMutationResponse,
  PipelineCopyMutationVariables
} from 'modules/settings/boards/types';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import Templates from '../components/Templates';
import { mutations, queries } from '../graphql';

type Props = {
  show: boolean;
  closeModal: () => void;
  boardId: string;
  pipelinesRefetch: ({ boardId }: { boardId?: string }) => Promise<any>;
};

type FinalProps = {
  templatesQuery: TemplatesQueryResponse;
  pipelinesCopyMutation: PipelineCopyMutation;
} & Props;

class PipelinesContainer extends React.Component<FinalProps> {
  render() {
    const { templatesQuery, pipelinesCopyMutation } = this.props;

    if (templatesQuery.loading) {
      return <Spinner />;
    }

    const pipelinesCopy = (variables: PipelineCopyMutationVariables) => {
      pipelinesCopyMutation({ variables }).then(({ data }) => {
        Alert.success('You successfully copied');

        this.props.pipelinesRefetch({ boardId: data.pipelinesCopy.boardId });
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
    graphql<Props, TemplatesQueryResponse>(gql(queries.growthHackTemplates), {
      name: 'templatesQuery'
    }),
    graphql<Props, PipelineCopyMutationResponse, PipelineCopyMutationVariables>(
      gql(mutations.pipelinesCopy),
      {
        name: 'pipelinesCopyMutation'
      }
    )
  )(PipelinesContainer)
);
