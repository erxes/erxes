import gql from 'graphql-tag';
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

const commonOptions = () => ({
  refetchQueries: [{ query: gql(queries.getSkillTypes) }]
});

export default commonListComposer<Props>({
  label: 'skillTypes',
  text: 'skill types',
  stringEditMutation: mutations.skillTypeEdit,
  stringAddMutation: mutations.skillTypeAdd,

  gqlListQuery: graphql<Props, SkillTypesQueryResponse>(
    gql(queries.getSkillTypes),
    {
      name: 'listQuery',
      options: ({ queryParams }) => ({
        notifyOnNetworkStatusChange: true,
        variabes: {
          perPage: queryParams.limit ? parseInt(queryParams.limit, 10) : 20
        }
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
      options: commonOptions()
    }
  ),

  gqlEditMutation: graphql<{}, SkillTypesEditMutation>(
    gql(mutations.skillTypeEdit),
    {
      name: 'editMutation',
      options: commonOptions()
    }
  ),

  gqlRemoveMutation: graphql<{}, SkillTypesRemoveMutation>(
    gql(mutations.skillTypeRemove),
    {
      name: 'removeMutation',
      options: commonOptions()
    }
  ),

  ListComponent: SkillTypes
});
