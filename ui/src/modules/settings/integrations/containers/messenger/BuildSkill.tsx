import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { withProps } from 'modules/common/utils';
import {
  SkillsQueryResponse,
  SkillTypesQueryResponse
} from 'modules/settings/skills/types';
import React, { useCallback, useEffect } from 'react';
import { graphql, useLazyQuery } from 'react-apollo';
import queries from '../../../skills/graphql/queries';
import BuildSkill from '../../components/messenger/steps/BuildSkill';
import { ISkillData } from '../../types';

type Props = {
  skillData?: ISkillData;
  onChange: (name: any, value: any) => void;
};

type FinalProps = {
  skillTypesQuery: SkillTypesQueryResponse;
} & Props;

function BuildSkillContainer({
  skillTypesQuery,
  skillData,
  onChange
}: FinalProps) {
  const initialTypeId = (skillData || ({} as ISkillData)).typeId || '';

  const [
    getSkills,
    { loading, data = {} as SkillsQueryResponse }
  ] = useLazyQuery<SkillsQueryResponse>(gql(queries.skills));

  const handleSkillTypeSelect = useCallback(
    (typeId: string) => {
      getSkills({ variables: { typeId, list: true } });
    },
    [getSkills]
  );

  useEffect(() => {
    if (initialTypeId.length > 0) {
      handleSkillTypeSelect(initialTypeId);
    }
  }, [initialTypeId, handleSkillTypeSelect]);

  return (
    <BuildSkill
      skillData={skillData}
      onChange={onChange}
      skillTypes={skillTypesQuery.skillTypes || []}
      skills={data.skills || []}
      loading={loading}
      handleSkillTypeSelect={handleSkillTypeSelect}
    />
  );
}

export default withProps<Props>(
  compose(
    graphql<Props, SkillTypesQueryResponse>(gql(queries.skillTypes), {
      name: 'skillTypesQuery'
    })
  )(BuildSkillContainer)
);
