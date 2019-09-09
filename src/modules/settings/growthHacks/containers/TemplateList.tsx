import client from 'apolloClient';
import gql from 'graphql-tag';
import { IButtonMutateProps } from 'modules/common/types';
import { Alert } from 'modules/common/utils';
import { generatePaginationParams } from 'modules/common/utils/router';
import {
  ICommonFormProps,
  ICommonListProps
} from 'modules/settings/common/types';
import React from 'react';
import { graphql } from 'react-apollo';
import { commonListComposer } from '../../utils';
import TemplateList from '../components/TemplateList';
import { mutations, queries } from '../graphql';
import { IPipelineTemplate } from '../types';

export type PipelineTemplatesQueryResponse = {
  pipelineTemplates: IPipelineTemplate[];
  loading: boolean;
  refetch: () => void;
};

type Props = ICommonListProps &
  ICommonFormProps & {
    queryParams: any;
    renderButton: (props: IButtonMutateProps) => JSX.Element;
  };

class TemplateListContainer extends React.Component<Props> {
  duplicate = (id: string) => {
    client
      .mutate({
        mutation: gql(mutations.pipelineTemplatesDuplicate),
        variables: { _id: id }
      })
      .then(() => {
        Alert.success('Successfully duplicated a template');

        this.props.refetch();
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  render() {
    return <TemplateList {...this.props} duplicate={this.duplicate} />;
  }
}

export default commonListComposer<Props>({
  text: 'growth hack template',
  label: 'pipelineTemplates',
  stringEditMutation: mutations.pipelineTemplatesEdit,
  stringAddMutation: mutations.pipelineTemplatesAdd,

  gqlListQuery: graphql(gql(queries.pipelineTemplates), {
    name: 'listQuery',
    options: ({ queryParams }: { queryParams: any }) => {
      return {
        notifyOnNetworkStatusChange: true,
        variables: {
          ...generatePaginationParams(queryParams),
          type: 'growthHack'
        }
      };
    }
  }),

  gqlTotalCountQuery: graphql(gql(queries.totalCount), {
    name: 'totalCountQuery'
  }),

  gqlAddMutation: graphql(gql(mutations.pipelineTemplatesAdd), {
    name: 'addMutation'
  }),

  gqlEditMutation: graphql(gql(mutations.pipelineTemplatesEdit), {
    name: 'editMutation'
  }),

  gqlRemoveMutation: graphql(gql(mutations.pipelineTemplatesRemove), {
    name: 'removeMutation'
  }),

  ListComponent: TemplateListContainer
});
