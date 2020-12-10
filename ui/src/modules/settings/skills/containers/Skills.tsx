import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import Skills from '../components/Skills';
import queries from '../graphql/queries';
import { SkillTypesQueryResponse } from '../types';

type Props = {
  history: any;
  queryParams: any;
  skillTypesQuery: SkillTypesQueryResponse;
};

const List = (props: Props) => {
  const { skillTypesQuery, history, queryParams } = props;

  const updatedProps = {
    history,
    queryParams,
    skillTypes: skillTypesQuery.skillTypes || []
  };

  return <Skills {...updatedProps} />;
};

export default compose(
  graphql<Props, SkillTypesQueryResponse>(gql(queries.getSkillTypes), {
    name: 'skillTypesQuery'
  })
)(List);
