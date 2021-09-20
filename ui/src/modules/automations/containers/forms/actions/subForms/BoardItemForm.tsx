import client from 'apolloClient';
import gql from 'graphql-tag';
import BoardItemForm from 'modules/automations/components/forms/actions/subForms/BoardItemForm';
import { IAction } from 'modules/automations/types';
import { queries } from 'modules/boards/graphql';
import React from 'react';

type IProps = {
  activeAction: IAction;
  triggerType: string;
  closeModal: () => void;
  addAction: (action: IAction, actionId?: string, config?: any) => void;
};

class BoardItemSelectContainer extends React.Component<IProps> {
  fetchCards = (stageId: string, callback: (cards: any) => void) => {
    const { activeAction } = this.props;

    let type = '';

    switch (activeAction.type) {
      case 'createDeal':
        type = 'deal';
        break;

      case 'createTask':
        type = 'task';
        break;

      case 'createTicket':
        type = 'ticket';
        break;
    }

    client
      .query({
        query: gql(queries[`${type}s`]),
        fetchPolicy: 'network-only',
        variables: { stageId, limit: 0 }
      })
      .then(({ data }: any) => {
        callback(data[`${type}s`]);
      });
  };

  render() {
    const extendedProps = {
      ...this.props,
      fetchCards: this.fetchCards
    };

    return <BoardItemForm {...extendedProps} />;
  }
}

export default BoardItemSelectContainer;
