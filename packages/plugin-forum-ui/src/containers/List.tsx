import gql from 'graphql-tag';
import { graphql, useQuery } from 'react-apollo';
import { commonListComposer } from '@erxes/ui/src/utils';
import List from '../components/List';
import { mutations, queries } from '../graphql';
import React from 'react';
import {
  ICommonFormProps,
  ICommonListProps
} from '@erxes/ui-settings/src/common/types';
import { IButtonMutateProps } from '@erxes/ui/src/types';

type Props = ICommonListProps &
  ICommonFormProps & {
    queryParams: any;
    history: any;
    renderButton: (props: IButtonMutateProps) => JSX.Element;
    listQuery: any;
  };

class ListContainer extends React.Component<Props> {
  render() {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '200px 1fr'
        }}
      >
        <nav>
          <ul>
            <li>Categories</li>
            <li>Posts</li>
          </ul>
        </nav>

        <main style={{ backgroundColor: 'green' }}>asdfasdfasdf</main>
      </div>
    );
  }
}

export default commonListComposer<Props>({
  text: 'list',
  label: 'forums',
  stringAddMutation: mutations.add,

  gqlListQuery: graphql(gql(queries.list), {
    name: 'listQuery'
  }),

  gqlTotalCountQuery: graphql(gql(queries.totalCount), {
    name: 'totalCountQuery'
  }),

  gqlAddMutation: graphql(gql(mutations.add), {
    name: 'addMutation'
  }),
  ListComponent: ListContainer
});
