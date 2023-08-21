import * as compose from 'lodash.flowright';

import React, { useCallback, useEffect } from 'react';
import {
  SkillTypesQueryResponse,
  SkillsQueryResponse
} from '@erxes/ui-inbox/src/settings/skills/types';
import { gql, useLazyQuery } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';

import BuildSkill from '../../components/messenger/steps/BuildSkill';
import { ISkillData } from '@erxes/ui-inbox/src/settings/integrations/types';
import queries from '../../../skills/graphql/queries';
import { withProps } from '@erxes/ui/src/utils';

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
