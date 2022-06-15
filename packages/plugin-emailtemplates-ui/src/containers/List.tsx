import gql from 'graphql-tag';
import client from '@erxes/ui/src/apolloClient';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import { graphql } from 'react-apollo';
import { commonListComposer } from '@erxes/ui/src/utils';
import List from '../components/List';
import { mutations, queries } from '../graphql';
import { IEmailTemplate } from '../types';
import { Alert, confirm } from '@erxes/ui/src/utils';
import React from 'react';
import {
  ICommonFormProps,
  ICommonListProps
} from '@erxes/ui-settings/src/common/types';
import { IButtonMutateProps } from '@erxes/ui/src/types';

export type EmailTemplatesTotalCountQueryResponse = {
  emailTemplatesTotalCount: number;
};

export type EmailTemplatesQueryResponse = {
  fetchMore: (params: {
    variables: { page: number };
    updateQuery: (prev: any, fetchMoreResult: any) => void;
  }) => void;
  emailTemplates: IEmailTemplate[];
  variables: { [key: string]: string | number };
  loading: boolean;
  refetch: () => void;
};

type Props = ICommonListProps &
  ICommonFormProps & {
    queryParams: any;
    history: any;
    renderButton: (props: IButtonMutateProps) => JSX.Element;
    listQuery: any;
  };

class EmailListContainer extends React.Component<Props> {
  changeStatus = (_id: string, status: string, text: string) => {
    const message = `You are going to ${text} this email template. Are you sure?`;

    confirm(message).then(() => {
      client
        .mutate({
          mutation: gql(mutations.emailTemplatesChangeStatus),
          variables: { _id, status }
        })
        .then(({ data }) => {
          const template = data.emailTemplatesChangeStatus;

          if (template && template._id) {
            Alert.success(`Email template has been ${status}.`);
            this.props.listQuery.refetch();
          }
        })
        .catch(e => {
          Alert.error(e.message);
        });
    });
  };

  render() {
    return <List {...this.props} changeStatus={this.changeStatus} />;
  }
}

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
        variables: {
          searchValue: queryParams.searchValue,
          status: queryParams.status,
          ...generatePaginationParams(queryParams)
        }
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
  ListComponent: EmailListContainer
});
