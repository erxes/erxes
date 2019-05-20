import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { withProps } from 'modules/common/utils';
import { UsersQueryResponse } from 'modules/settings/team/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { queries as userquery } from '../../team/graphql';
import { PipelineForm } from '../components';
import { queries } from '../graphql';
import { IPipeline, IStage, StagesQueryResponse } from '../types';

type Props = {
  pipeline?: IPipeline;
  boardId: string;
  save: (
    params: { doc: { name: string; boardId?: string; stages: IStage[] } },
    callback: () => void,
    pipeline?: IPipeline
  ) => void;
  closeModal: () => void;
  show: boolean;
};

type FinalProps = {
  stagesQuery: StagesQueryResponse;
  usersQuery: UsersQueryResponse;
} & Props;

class PipelineFormContainer extends React.Component<FinalProps> {
  render() {
    const {
      stagesQuery,
      usersQuery,
      boardId,
      save,
      closeModal,
      pipeline
    } = this.props;

    if ((stagesQuery && stagesQuery.loading) || usersQuery.loading) {
      return <Spinner />;
    }

    const stages = stagesQuery ? stagesQuery.dealStages : [];
    const members = usersQuery.users.filter(user => user.username) || [];
    const memberIds = pipeline ? pipeline.memberIds || [] : [];

    const selectedMembers = members.filter(user =>
      memberIds.includes(user._id)
    );

    const extendedProps = {
      ...this.props,
      stages,
      boardId,
      save,
      closeModal,
      pipeline,
      members,
      selectedMembers
    };

    return <PipelineForm {...extendedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, StagesQueryResponse, { pipelineId: string }>(
      gql(queries.stages),
      {
        name: 'stagesQuery',
        skip: props => !props.pipeline,
        options: ({ pipeline }: { pipeline?: IPipeline }) => ({
          variables: { pipelineId: pipeline ? pipeline._id : '' },
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, UsersQueryResponse, {}>(gql(userquery.usersForSelector), {
      name: 'usersQuery',
      options: () => ({
        fetchPolicy: 'network-only'
      })
    })
  )(PipelineFormContainer)
);
