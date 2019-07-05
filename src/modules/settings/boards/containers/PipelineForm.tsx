import gql from 'graphql-tag';
import { StagesQueryResponse } from 'modules/boards/types';
import { IPipeline } from 'modules/boards/types';
import { Spinner } from 'modules/common/components';
import { IButtonMutateProps } from 'modules/common/types';
import { withProps } from 'modules/common/utils';
import { UsersQueryResponse } from 'modules/settings/team/types';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { queries as userQuery } from '../../team/graphql';
import { PipelineForm } from '../components';
import { queries } from '../graphql';

type Props = {
  pipeline?: IPipeline;
  boardId: string;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  show: boolean;
  type: string;
};

type FinalProps = {
  stagesQuery: StagesQueryResponse;
  usersQuery: UsersQueryResponse;
} & Props;

class PipelineFormContainer extends React.Component<FinalProps> {
  render() {
    const { stagesQuery, usersQuery, boardId, renderButton } = this.props;

    if ((stagesQuery && stagesQuery.loading) || usersQuery.loading) {
      return <Spinner />;
    }

    const stages = stagesQuery ? stagesQuery.stages : [];
    const members = usersQuery.users.filter(user => user.username) || [];

    const extendedProps = {
      ...this.props,
      stages,
      boardId,
      renderButton,
      members
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
    graphql<Props, UsersQueryResponse, {}>(gql(userQuery.users), {
      name: 'usersQuery',
      options: () => ({
        fetchPolicy: 'network-only'
      })
    })
  )(PipelineFormContainer)
);
