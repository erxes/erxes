import client from 'apolloClient';
import gql from 'graphql-tag';
import { queries } from 'modules/boards/graphql';
import { queries as fieldQueries } from 'modules/settings/properties/graphql';
import { IField } from 'modules/settings/properties/types';
import React from 'react';
import BoardItemSelect from '../components/BoardItemSelect';

type IProps = {
  boardId?: string;
  pipelineId?: string;
  stageId?: string;
  relType?: string;
  cardId?: string;
  cardName?: string;
  type: string;
  onChangeCard: (name?: string, cardId?: string) => void;
  onChangeStage: (stageId: string) => void;
  onChangeProperty: (selectedField?: IField) => void;
};

class BoardItemSelectContainer extends React.Component<IProps> {
  fetchCards = (stageId: string, callback: (cards: any) => void) => {
    const { type } = this.props;

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

  fetchProperties = (
    boardId: string,
    pipelineId: string,
    callback: (properites: IField[]) => void
  ) => {
    client
      .query({
        query: gql(fieldQueries.fields),
        fetchPolicy: 'network-only',
        variables: { contentType: this.props.type, boardId, pipelineId }
      })
      .then(({ data }: any) => {
        callback(data);
      });
  };

  render() {
    const extendedProps = {
      ...this.props,
      fetchCards: this.fetchCards,
      fetchProperties: this.fetchProperties
    };

    return <BoardItemSelect {...extendedProps} />;
  }
}

export default BoardItemSelectContainer;
