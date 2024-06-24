import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { withProps } from '@erxes/ui/src/utils';
import BoardItemForm from '../components/BoardItemForm';
import { IAction } from '@erxes/ui-automations/src/types';
import { graphql } from '@apollo/client/react/hoc';
import { queries as teamQueries } from '@erxes/ui/src/team/graphql';
import { queries as pipelineQuery } from '@erxes/ui-cards/src/boards/graphql';
import React from 'react';
import { AllUsersQueryResponse } from '@erxes/ui/src/auth/types';
import { PipelineLabelsQueryResponse } from '@erxes/ui-cards/src/boards/types';

type Props = {
  activeAction: IAction;
  triggerType: string;
  closeModal: () => void;
  addAction: (action: IAction, actionId?: string, config?: any) => void;
};

type FinalProps = {
  allUserQuery: AllUsersQueryResponse;
  pipelineLabelQuery: PipelineLabelsQueryResponse;
} & Props;

class BoardItemSelectContainer extends React.Component<FinalProps> {
  render() {
    const { allUserQuery, pipelineLabelQuery, activeAction } = this.props;

    if (
      allUserQuery.loading ||
      (activeAction.config && pipelineLabelQuery.loading)
    ) {
      return null;
    }

    const users = allUserQuery.allUsers || [];
    const pipelineLabels = pipelineLabelQuery
      ? pipelineLabelQuery.pipelineLabels || []
      : [];

    const extendedProps = {
      ...this.props,
      users,
      pipelineLabels
    };

    return <BoardItemForm {...extendedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, AllUsersQueryResponse, {}>(gql(teamQueries.allUsers), {
      name: 'allUserQuery',
      options: () => ({
        variables: {
          isActive: true
        }
      })
    }),
    graphql<Props, PipelineLabelsQueryResponse, {}>(
      gql(pipelineQuery.pipelineLabels),
      {
        name: 'pipelineLabelQuery',
        skip: ({ activeAction }) => !activeAction.config,
        options: ({ activeAction }) => ({
          variables: {
            pipelineId: activeAction.config
              ? activeAction.config.pipelineId
              : ''
          }
        })
      }
    )
  )(BoardItemSelectContainer)
);
