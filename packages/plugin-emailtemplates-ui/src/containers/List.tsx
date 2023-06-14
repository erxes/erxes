import { gql } from '@apollo/client';
import client from '@erxes/ui/src/apolloClient';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import { graphql } from '@apollo/client/react/hoc';
import { commonListComposer } from '@erxes/ui/src/utils';
import List from '../components/List';
import { mutations, queries } from '../graphql';
import { IEmailTemplate } from '../types';
import { Alert } from '@erxes/ui/src/utils';
import React from 'react';
import {
  ICommonFormProps,
  ICommonListProps
} from '@erxes/ui-settings/src/common/types';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import Bulk from '@erxes/ui/src/components/Bulk';

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
  duplicate = (id: string) => {
    client
      .mutate({
        mutation: gql(mutations.emailTemplatesDuplicate),
        variables: { _id: id }
      })
      .then((res: any) => {
        Alert.success('Successfully duplicated a template');

        this.props.refetch();
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  render() {
    const updatedProps = {
      ...this.props,
      duplicate: this.duplicate
    };

    const content = props => {
      return (
        <List
          {...updatedProps}
          {...props}
          {...generatePaginationParams(this.props.queryParams)}
        />
      );
    };

    return (
      <Bulk
        content={content}
        // refetch={this.props.customersMainQuery.refetch}
      />
    );
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
          tag: queryParams.tag,
          ...generatePaginationParams(queryParams)
        }
      };
    }
  }),
  gqlTotalCountQuery: graphql(gql(queries.totalCount), {
    name: 'totalCountQuery',
    options: ({ queryParams }: { queryParams: any }) => ({
      variables: {
        searchValue: queryParams.searchValue
      }
    })
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
