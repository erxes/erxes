import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { IItemParams } from 'modules/boards/types';
import { withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import { queries } from '../graphql';
import { ChecklistsQueryResponse, IChecklistsParam } from '../types';
import List from './List';

type IProps = {
  contentType: string;
  contentTypeId: string;
  stageId: string;
  addItem: (doc: IItemParams, callback: () => void) => void;
};

type FinalProps = {
  checklistsQuery: ChecklistsQueryResponse;
} & IProps;

const ChecklistsContainer = (props: FinalProps) => {
  const { checklistsQuery, stageId, addItem } = props;

  if (checklistsQuery.loading) {
    return null;
  }

  const checklists = checklistsQuery.checklists || [];

  return checklists.map(list => (
    <List
      key={list._id}
      listId={list._id}
      stageId={stageId}
      addItem={addItem}
    />
  ));
};

export default withProps<IProps>(
  compose(
    graphql<IProps, ChecklistsQueryResponse, IChecklistsParam>(
      gql(queries.checklists),
      {
        name: 'checklistsQuery',
        options: ({ contentType, contentTypeId }) => ({
          variables: {
            contentType,
            contentTypeId
          },
          refetchQueries: ['checklists']
        })
      }
    )
  )(ChecklistsContainer)
);
