import gql from 'graphql-tag';
import { renderWithProps } from 'modules/common/utils';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { queries } from '../graphql';
import { ChecklistsQueryResponse, IChecklistsParam } from '../types';
import List from './List';

type IProps = {
  contentType: string;
  contentTypeId: string;
};

type FinalProps = {
  checklistsQuery: ChecklistsQueryResponse;
} & IProps;

const ChecklistsContainer = (props: FinalProps) => {
  const { checklistsQuery } = props;

  if (checklistsQuery.loading) {
    return null;
  }

  const checklists = checklistsQuery.checklists || [];

  return checklists.map(list => <List key={list._id} listId={list._id} />);
};

export default (props: IProps) =>
  renderWithProps<IProps>(
    props,
    compose(
      graphql<IProps, ChecklistsQueryResponse, IChecklistsParam>(
        gql(queries.checklists),
        {
          name: 'checklistsQuery',
          options: () => ({
            variables: {
              contentType: props.contentType,
              contentTypeId: props.contentTypeId
            },
            refetchQueries: ['checklists']
          })
        }
      )
    )(ChecklistsContainer)
  );
