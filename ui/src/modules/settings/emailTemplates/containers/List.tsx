import gql from 'graphql-tag';
import { generatePaginationParams } from 'modules/common/utils/router';
import { graphql } from 'react-apollo';
import { commonListComposer } from '../../utils';
import List from '../components/List';
import { mutations, queries } from '../graphql';
import { IEmailTemplate } from '../types';

export type EmailTemplatesTotalCountQueryResponse = {
  emailTemplatesTotalCount: number
};

export type EmailTemplatesQueryResponse = {
  fetchMore: (params: { variables: { page: number }, updateQuery: (prev: any, fetchMoreResult: any ) => void }) => void;
  emailTemplates: IEmailTemplate[];
  variables: { [key: string]: string | number }
  loading: boolean;
  refetch: () => void;
};

type Props = {
  queryParams: any;
};

export default commonListComposer<Props>({
  text: 'email template',
  label: 'emailTemplates',
  stringEditMutation: mutations.emailTemplatesEdit,
  stringAddMutation: mutations.emailTemplatesAdd,

  gqlListQuery: graphql(gql(queries.emailTemplates), {
    name: 'listQuery',
    options: ({ queryParams }: { queryParams: any }) => {
      return {
        notifyOnNetworkStatusChange: true,
        variables: generatePaginationParams(queryParams)
      };
    }
  }),

  gqlTotalCountQuery: graphql(gql(queries.totalCount), {
    name: 'totalCountQuery'
  }),

  gqlAddMutation: graphql(gql(mutations.emailTemplatesAdd), {
    name: 'addMutation'
  }),

  gqlEditMutation: graphql(gql(mutations.emailTemplatesEdit), {
    name: 'editMutation'
  }),

  gqlRemoveMutation: graphql(gql(mutations.emailTemplatesRemove), {
    name: 'removeMutation'
  }),

  ListComponent: List
});
