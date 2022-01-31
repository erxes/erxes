import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { withProps } from 'modules/common/utils';
import BoardItemForm from 'modules/automations/components/forms/actions/subForms/BoardItemForm';
import { IAction } from 'modules/automations/types';
import { graphql } from 'react-apollo';
import { queries as userQueries } from 'modules/settings/team/graphql';
import { queries as pipelineQuery } from 'modules/boards/graphql';
import React from 'react';
import { AllUsersQueryResponse } from 'modules/settings/team/types';
import { PipelineLabelsQueryResponse } from 'modules/boards/types';

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
    graphql<Props, AllUsersQueryResponse, {}>(gql(userQueries.allUsers), {
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
