import gql from 'graphql-tag';
import { renderWithProps } from 'modules/common/utils';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import Checklists from '../components/Checklists';
import { queries } from '../graphql';
import { ChecklistsQueryResponse, IChecklistsParam } from '../types';

type IProps = {
  contentType: string;
  contentTypeId: string;
};

type FinalProps = {
  checklistsQuery: ChecklistsQueryResponse;
} & IProps;

class ChecklistsContainer extends React.Component<FinalProps> {
  //   onChangeItems = () => {
  //     const { checklistsQuery } = this.props;

  //     checklistsQuery.refetch();
  //   };

  render() {
    const { checklistsQuery } = this.props;

    if (!checklistsQuery) {
      return null;
    }

    const checklists = checklistsQuery.checklists || [];
    console.log('checklists', checklists);

    const extendedProps = {
      ...this.props,
      checklists
    };

    return <Checklists {...extendedProps} />;
  }
}

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
            }
          })
        }
      )
    )(ChecklistsContainer)
  );
