import React from 'react';
import List from '../components/List';
import { gql, useQuery, useMutation } from '@apollo/client';
import Alert from '@erxes/ui/src/utils/Alert/index';
import confirm from '@erxes/ui/src/utils/confirmation/confirm';
import { mutations, queries } from '../../../ui-template/src/graphql';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import {
  ITemplate,
  TemplateListQueryResponse,
  TemplateRemoveMutationResponse
} from '@erxes/ui-template/src/types';

type Props = {
  location: any;
  navigate: any;
  queryParams?: any;
};

const ListContainer = (props: Props) => {
  const { queryParams, navigate } = props;

  const { data, loading, refetch } = useQuery<TemplateListQueryResponse>(
    gql(queries.templateList),
    {
      variables: {
        ...generatePaginationParams(queryParams),
        searchValue: queryParams.searchValue,
        categoryIds: queryParams.categoryIds,
        contentType: queryParams.contentType
      }
    }
  );

  const [templateRemove] = useMutation<TemplateRemoveMutationResponse>(
    gql(mutations.templateRemove),
    {
      refetchQueries: ['templateList']
    }
  );
  const [templateUse] = useMutation(gql(mutations.templateUse));

  const removeTemplate = (_id: string) => {
    confirm('Are you sure to delete selected template?').then(() => {
      templateRemove({ variables: { _id } })
        .then(() => {
          refetch();
          Alert.success('Successfully deleted a template');
        })
        .catch((e: Error) => Alert.error(e.message));
    });
  };

  const useTemplate = (_id: string) => {

    templateUse({ variables: { _id } })
      .then((res) => {
        const { reDirect } = res.data.templateUse;
        if (reDirect) {
          navigate(reDirect);
        }
      })
      .catch((e: Error) => Alert.error(e.message));
  };

  const { list = [], totalCount = 0 } = data?.templateList || {};

  const finalProps = {
    ...props,
    templates: list,
    totalCount,
    loading,

    removeTemplate,
    useTemplate,
    refetch
  };

  return <List {...finalProps} />;
};

export default ListContainer;
