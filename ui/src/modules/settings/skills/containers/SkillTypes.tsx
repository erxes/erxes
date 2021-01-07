import gql from 'graphql-tag';
import { generatePaginationParams } from 'modules/common/utils/router';
import { graphql } from 'react-apollo';
import { commonListComposer } from '../../utils';
import SkillTypes from '../components/SkillTypes';
import mutations from '../graphql/mutations';
import queries from '../graphql/queries';
import {
  SkillTypesAddMutation,
  SkillTypesEditMutation,
  SkillTypesQueryResponse,
  SkillTypesRemoveMutation,
  SkillTypesTotalCountQueryResponse
} from '../types';

type Props = {
  queryParams: any;
};

const commonOptions = ({ queryParams }: { queryParams?: any }) => ({
  refetchQueries: [
    { query: gql(queries.skillTypes) },
    { query: gql(queries.skills) },
    {
      query: gql(queries.skills),
      variables: {
        typeId: queryParams.typeId,
        ...generatePaginationParams(queryParams)
      }
    }
  ]
});

export default commonListComposer<Props>({
  label: 'skillTypes',
  text: 'skill types',
  stringEditMutation: mutations.skillTypeEdit,
  stringAddMutation: mutations.skillTypeAdd,

  confirmProps: {
    message:
      'This will permanently delete this skill type and skills in it. Are you absolutely sure?',
    options: { hasDeleteConfirm: true }
  },

  gqlListQuery: graphql<Props, SkillTypesQueryResponse>(
    gql(queries.skillTypes),
    {
      name: 'listQuery',
      options: () => ({
        notifyOnNetworkStatusChange: true
      })
    }
  ),

  gqlTotalCountQuery: graphql<{}, SkillTypesTotalCountQueryResponse>(
    gql(queries.skillTypesTotalCount),
    {
      name: 'totalCountQuery'
    }
  ),

  gqlAddMutation: graphql<{}, SkillTypesAddMutation>(
    gql(mutations.skillTypeAdd),
    {
      name: 'addMutation',
      options: commonOptions
    }
  ),

  gqlEditMutation: graphql<{}, SkillTypesEditMutation>(
    gql(mutations.skillTypeEdit),
    {
      name: 'editMutation',
      options: commonOptions
    }
  ),

  gqlRemoveMutation: graphql<Props, SkillTypesRemoveMutation>(
    gql(mutations.skillTypeRemove),
    {
      name: 'removeMutation',
      options: commonOptions
    }
  ),

  ListComponent: SkillTypes
});
